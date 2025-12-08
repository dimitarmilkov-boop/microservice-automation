"""
Threads Automation Service - Session Scheduler
Handles random daily session allocation and execution for multiple profiles

Based on ig-engagement-service scheduler pattern with support for:
- Growth (Follow) sessions
- Comment sessions
- Multiple GoLogin profiles
- Human-like random scheduling
"""

import sys
import os
import random
import time
import logging
from datetime import datetime, date, time as dt_time, timedelta
from typing import List, Dict, Optional
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from config import Config, get_config
from database import Database
from shared.browser_automation import BrowserProfileManager

logger = logging.getLogger(__name__)


class ThreadsScheduler:
    """
    Manages random session scheduling for Threads automation
    
    Features:
    - Allocates sessions randomly throughout the day (during active hours)
    - Supports both Growth (follow) and Comment task types
    - Checks every 5 minutes if sessions are due
    - Launches appropriate workers when sessions are ready
    - Respects daily limits per profile
    """
    
    def __init__(self, db: Database = None):
        self.config = get_config()
        self.db = db or Database(str(self.config.get_database_path()))
        self.profile_manager = BrowserProfileManager()
        self._last_allocation_date = None
        self._profile_cache = {}  # Cache profile name -> ID mapping
        
    def _cache_profiles(self):
        """Cache profile name to ID mapping to avoid repeated API calls"""
        profile_names = self.config.get_profile_names()
        
        if not profile_names:
            logger.warning("No Threads profiles configured! Set GOLOGIN_THREADS_PROFILES in .env")
            return
        
        logger.info(f"Caching {len(profile_names)} GoLogin profiles...")
        
        for profile_name in profile_names:
            try:
                profile_id = self.profile_manager.get_profile_id_by_name(profile_name)
                if profile_id:
                    self._profile_cache[profile_name] = profile_id
                    logger.debug(f"  {profile_name} -> {profile_id[:8]}...")
                else:
                    logger.warning(f"  Profile not found in GoLogin: {profile_name}")
            except Exception as e:
                logger.error(f"  Error fetching profile {profile_name}: {e}")
        
        logger.info(f"Cached {len(self._profile_cache)} profiles")
    
    def allocate_daily_sessions(self):
        """
        Allocate sessions for today for all profiles
        Called once per day
        """
        today = date.today()
        
        # Check if already allocated
        if self.db.has_sessions_allocated_for_date(today):
            logger.info(f"Sessions already allocated for {today}")
            return
        
        logger.info(f"\n{'='*60}")
        logger.info(f"ALLOCATING SESSIONS FOR {today}")
        logger.info(f"{'='*60}")
        
        # Cache profiles if not done
        if not self._profile_cache:
            self._cache_profiles()
        
        if not self._profile_cache:
            logger.error("No profiles found! Check GOLOGIN_THREADS_PROFILES in .env")
            return
        
        sessions_per_profile = self.config.SESSIONS_PER_PROFILE
        growth_targets = self.config.get_growth_targets()
        
        logger.info(f"Sessions per profile: {sessions_per_profile}")
        logger.info(f"Growth targets: {growth_targets}")
        
        for profile_name, profile_id in self._profile_cache.items():
            try:
                self._allocate_profile_sessions(
                    profile_id=profile_id,
                    profile_name=profile_name,
                    target_date=today,
                    num_sessions=sessions_per_profile,
                    growth_targets=growth_targets
                )
            except Exception as e:
                logger.error(f"Failed to allocate sessions for {profile_name}: {e}")
        
        self._last_allocation_date = today
        logger.info(f"Session allocation complete for {len(self._profile_cache)} profiles\n")
    
    def _allocate_profile_sessions(self, profile_id: str, profile_name: str,
                                   target_date: date, num_sessions: int,
                                   growth_targets: List[str]):
        """
        Allocate random session times for a profile
        
        Sessions are distributed:
        - Only during active hours (default 9am-10pm)
        - Random times with at least 2 hours apart
        - Alternating between Growth and Comment tasks
        """
        active_start = self.config.ACTIVE_HOURS_START
        active_end = self.config.ACTIVE_HOURS_END
        
        # Generate random hours within active window
        available_hours = list(range(active_start, active_end))
        
        # Ensure we don't schedule more sessions than available hours
        num_sessions = min(num_sessions, len(available_hours) // 2)  # At least 2h apart
        
        # Pick random hours with spacing
        selected_hours = []
        remaining_hours = available_hours.copy()
        
        for _ in range(num_sessions):
            if not remaining_hours:
                break
            hour = random.choice(remaining_hours)
            selected_hours.append(hour)
            # Remove nearby hours to ensure spacing
            remaining_hours = [h for h in remaining_hours if abs(h - hour) >= 2]
        
        selected_hours.sort()
        
        # Assign task types (alternate growth/comment or all growth if no targets)
        task_types = []
        for i in range(len(selected_hours)):
            if i % 2 == 0:
                task_types.append('growth')
            else:
                task_types.append('comment')
        
        # Create sessions
        for i, hour in enumerate(selected_hours):
            minute = random.randint(0, 59)
            scheduled_time = dt_time(hour, minute)
            scheduled_datetime = datetime.combine(target_date, scheduled_time)
            
            task_type = task_types[i]
            
            # Assign a target for growth sessions
            target_username = None
            if task_type == 'growth' and growth_targets:
                target_username = random.choice(growth_targets)
            
            self.db.add_scheduled_session(
                profile_id=profile_id,
                profile_name=profile_name,
                scheduled_datetime=scheduled_datetime,
                task_type=task_type,
                target_username=target_username
            )
        
        logger.info(f"  {profile_name}: Allocated {len(selected_hours)} sessions")
        for i, hour in enumerate(selected_hours):
            task = task_types[i]
            target = f" -> @{growth_targets[i % len(growth_targets)]}" if task == 'growth' and growth_targets else ""
            logger.info(f"    {hour:02d}:XX - {task}{target}")
    
    def check_and_run_due_sessions(self):
        """
        Check if any sessions are due and run them
        Called every N minutes (configurable)
        """
        current_time = datetime.now()
        
        # Get pending sessions that are due
        due_sessions = self.db.get_pending_sessions(current_time)
        
        if not due_sessions:
            logger.debug(f"No sessions due at {current_time.strftime('%H:%M')}")
            return
        
        logger.info(f"\n[SCHEDULER] Found {len(due_sessions)} due session(s)")
        
        for session_data in due_sessions:
            try:
                self._run_session(session_data)
            except Exception as e:
                logger.error(f"Failed to run session {session_data['id']}: {e}")
                self.db.update_session_status(
                    session_data['id'],
                    'failed',
                    error_message=str(e)
                )
    
    def _run_session(self, session_data: Dict):
        """
        Execute a scheduled session
        
        Args:
            session_data: Dict containing scheduled session info
        """
        scheduled_id = session_data['id']
        profile_id = session_data['profile_id']
        profile_name = session_data['profile_name']
        task_type = session_data['task_type']
        target_username = session_data.get('target_username')
        
        print(f"\n{'='*60}")
        print(f"[SESSION START] {profile_name}")
        print(f"   Task: {task_type}")
        if target_username:
            print(f"   Target: @{target_username}")
        print(f"   Scheduled ID: {scheduled_id}")
        print(f"{'='*60}\n")
        
        logger.info(f"Starting {task_type} session for {profile_name}")
        
        try:
            # Mark as running
            self.db.update_session_status(scheduled_id, 'running')
            
            # Run the appropriate worker
            if task_type == 'growth':
                result = self._run_growth_session(profile_id, profile_name, target_username)
            elif task_type == 'comment':
                result = self._run_comment_session(profile_id, profile_name)
            else:
                raise ValueError(f"Unknown task type: {task_type}")
            
            # Mark as completed
            self.db.update_session_status(
                scheduled_id,
                'completed',
                linked_session_id=result.get('session_id')
            )
            
            print(f"\n[SESSION COMPLETE] {profile_name}")
            print(f"   Actions: {result.get('actions', 0)}")
            print(f"   Errors: {result.get('errors', 0)}\n")
            
        except Exception as e:
            logger.error(f"Session failed for {profile_name}: {e}", exc_info=True)
            print(f"\n[SESSION FAILED] {profile_name}: {e}\n")
            
            self.db.update_session_status(
                scheduled_id,
                'failed',
                error_message=str(e)[:500]
            )
    
    def _run_growth_session(self, profile_id: str, profile_name: str, 
                           target_username: str = None) -> Dict:
        """Run a Growth (Follow) session"""
        from threads_growth_worker import ThreadsGrowthWorker
        
        # Use provided target or pick random from config
        if not target_username:
            targets = self.config.get_growth_targets()
            if targets:
                target_username = random.choice(targets)
            else:
                raise ValueError("No growth target specified and no defaults configured")
        
        logger.info(f"Running Growth session: {profile_name} -> @{target_username}")
        
        worker = ThreadsGrowthWorker(
            profile_id=profile_id,
            target_username=target_username,
            db=self.db
        )
        
        worker.start()
        
        return {
            'session_id': worker.session_id,
            'actions': worker.stats.get('follows', 0),
            'errors': worker.stats.get('errors', 0)
        }
    
    def _run_comment_session(self, profile_id: str, profile_name: str) -> Dict:
        """Run a Comment session"""
        from threads_comment_worker import ThreadsCommentWorker
        
        logger.info(f"Running Comment session: {profile_name}")
        
        worker = ThreadsCommentWorker(
            profile_id=profile_id,
            db=self.db
        )
        
        worker.start()
        
        return {
            'session_id': worker.session_id,
            'actions': worker.stats.get('comments', 0) + worker.stats.get('likes', 0),
            'errors': worker.stats.get('errors', 0)
        }
    
    def run(self):
        """
        Main scheduler loop
        - Allocates sessions daily
        - Checks for due sessions every N minutes
        """
        check_interval = self.config.SCHEDULER_CHECK_INTERVAL
        
        print(f"\n{'='*60}")
        print(f"THREADS AUTOMATION SCHEDULER")
        print(f"{'='*60}")
        print(f"Check interval: {check_interval} seconds ({check_interval // 60} min)")
        print(f"Active hours: {self.config.ACTIVE_HOURS_START}:00 - {self.config.ACTIVE_HOURS_END}:00")
        print(f"Sessions per profile per day: {self.config.SESSIONS_PER_PROFILE}")
        print(f"{'='*60}\n")
        
        logger.info("Starting Threads scheduler...")
        
        # Cache profiles at startup
        self._cache_profiles()
        
        # Initial allocation if needed
        if self._last_allocation_date != date.today():
            self.allocate_daily_sessions()
        
        # Main loop
        while True:
            try:
                current_time = datetime.now()
                current_date = current_time.date()
                
                # Check if we need to allocate for new day
                if self._last_allocation_date != current_date:
                    self.allocate_daily_sessions()
                    # Clean up old sessions
                    self.db.clear_old_scheduled_sessions(days_old=7)
                
                # Check for due sessions
                self.check_and_run_due_sessions()
                
                # Display next check time
                next_check = current_time + timedelta(seconds=check_interval)
                logger.debug(f"Next check at {next_check.strftime('%H:%M:%S')}")
                
                # Sleep until next check
                time.sleep(check_interval)
                
            except KeyboardInterrupt:
                print("\n[SCHEDULER] Stopped by user")
                logger.info("Scheduler stopped by user")
                break
                
            except Exception as e:
                logger.error(f"Scheduler error: {e}", exc_info=True)
                print(f"\n[ERROR] {e}")
                # Continue running after error
                time.sleep(60)


def run_scheduler():
    """Entry point for scheduler"""
    scheduler = ThreadsScheduler()
    scheduler.run()


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(
                Path(__file__).parent / 'logs' / 'scheduler.log',
                mode='a'
            )
        ]
    )
    
    # Ensure logs directory exists
    (Path(__file__).parent / 'logs').mkdir(exist_ok=True)
    
    run_scheduler()

