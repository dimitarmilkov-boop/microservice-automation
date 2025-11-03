"""
Instagram Engagement Service - Session Scheduler
Handles random daily session allocation and execution checking
"""

import random
import time
import logging
from datetime import datetime, date, time as dt_time, timedelta
from typing import List, Dict
from pathlib import Path

from config import get_settings
from database import DatabaseManager
from shared.browser_automation import BrowserProfileManager

logger = logging.getLogger(__name__)


class SessionScheduler:
    """
    Manages random session scheduling for Instagram profiles
    - Allocates sessions randomly throughout the day (00:01 daily)
    - Checks every 5 minutes if sessions are due
    - Launches automation workers when sessions are ready
    """
    
    def __init__(self, db_manager: DatabaseManager):
        self.settings = get_settings()
        self.db = db_manager
        self.profile_manager = BrowserProfileManager()
        self._last_allocation_date = None
    
    def allocate_daily_sessions(self):
        """
        Allocate sessions for today for all profiles
        Called once per day at 00:01
        """
        today = date.today()
        
        logger.info(f"Allocating sessions for {today}")
        
        # Get profile IDs from profile names
        profile_data = self._get_profile_data()
        
        if not profile_data:
            logger.error("No Instagram profiles found! Check GOLOGIN_IG_PROFILES in .env")
            return
        
        # Calculate how many sessions per profile
        sessions_per_profile = self.settings.sessions_per_profile
        
        logger.info(f"Scheduling {sessions_per_profile} sessions per profile")
        
        for profile_name, profile_id in profile_data.items():
            try:
                self._allocate_profile_sessions(
                    profile_id, 
                    profile_name, 
                    today, 
                    sessions_per_profile
                )
            except Exception as e:
                logger.error(f"Failed to allocate sessions for {profile_name}: {e}")
        
        self._last_allocation_date = today
        logger.info(f"Session allocation complete for {len(profile_data)} profiles")
    
    def _get_profile_data(self) -> Dict[str, str]:
        """Get profile IDs from names using BrowserProfileManager"""
        profile_data = {}
        
        for profile_name in self.settings.profile_names:
            try:
                profile_id = self.profile_manager.get_profile_id_by_name(profile_name)
                if profile_id:
                    profile_data[profile_name] = profile_id
                    logger.debug(f"Found profile: {profile_name} -> {profile_id}")
                else:
                    logger.warning(f"Profile not found in GoLogin: {profile_name}")
            except Exception as e:
                logger.error(f"Error fetching profile {profile_name}: {e}")
        
        return profile_data
    
    def _allocate_profile_sessions(self, profile_id: str, profile_name: str, 
                                   target_date: date, num_sessions: int):
        """
        Allocate random session times for a profile
        
        Args:
            profile_id: GoLogin profile ID
            profile_name: GoLogin profile name
            target_date: Date to schedule sessions for
            num_sessions: Number of sessions to create
        """
        # Generate random hours (0-23) for each session
        hours = random.sample(range(0, 24), min(num_sessions, 24))
        
        for hour in hours:
            # Add random minutes for more randomness
            minute = random.randint(0, 59)
            
            # Create scheduled datetime
            scheduled_time = dt_time(hour, minute)
            scheduled_datetime = datetime.combine(target_date, scheduled_time)
            
            # Add to database
            self.db.add_scheduled_session(
                profile_id=profile_id,
                profile_name=profile_name,
                scheduled_datetime=scheduled_datetime,
                posts_target=self.settings.ig_posts_per_session
            )
        
        logger.info(f"Allocated {len(hours)} sessions for {profile_name}")
    
    def check_and_run_due_sessions(self):
        """
        Check if any sessions are due and run them
        Called every 5 minutes in the main loop
        """
        current_time = datetime.now()
        
        # Get pending sessions that are due
        due_sessions = self.db.get_pending_sessions(current_time)
        
        if not due_sessions:
            logger.debug(f"No sessions due at {current_time.strftime('%H:%M')}")
            return
        
        logger.info(f"Found {len(due_sessions)} due session(s)")
        
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
        Execute a scheduled session for ONE profile
        
        Args:
            session_data: Dict containing scheduled session info from scheduled_sessions table
        """
        scheduled_session_id = session_data['id']
        profile_id = session_data['profile_id']
        profile_name = session_data['profile_name']
        posts_target = session_data['posts_target']
        
        logger.info(f"\n[SESSION START] Starting session for profile: {profile_name}")
        logger.info(f"   Scheduled session ID: {scheduled_session_id}")
        logger.info(f"   Due session found: {session_data.get('scheduled_time')}")
        
        print(f"\n[SESSION START] Starting session for profile: {profile_name}")
        
        try:
            # Mark scheduled session as running
            conn = self.db.conn
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE scheduled_sessions 
                SET status = 'running', started_at = ?
                WHERE id = ?
            """, (datetime.now(), scheduled_session_id))
            conn.commit()
            logger.info(f"   Marked scheduled_session as 'running'")
            
            # Create and run automation worker
            from automation_worker import InstagramWorker
            
            worker = InstagramWorker(
                profile_id=profile_id,
                profile_name=profile_name,
                settings=self.settings
            )
            
            # Run the automation (worker handles its own session tracking)
            result = worker.run_session(posts_target=posts_target)
            
            # Update scheduled session status
            cursor.execute("""
                UPDATE scheduled_sessions 
                SET status = 'completed', completed_at = ?, session_id = ?
                WHERE id = ?
            """, (datetime.now(), result.get('session_id'), scheduled_session_id))
            conn.commit()
            
            logger.info(f"[OK] Session complete: {result['posts_processed']} posts, {result['likes_performed']} likes")
            logger.info(f"   Scheduled session marked as 'completed'\n")
            print(f"[OK] Session complete: {result['posts_processed']} posts, {result['likes_performed']} likes\n")
        
        except Exception as e:
            logger.error(f"[ERROR] Session failed for {profile_name}: {e}", exc_info=True)
            print(f"[ERROR] Session failed for {profile_name}: {e}\n")
            
            # Mark scheduled session as failed
            try:
                conn = self.db.conn
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE scheduled_sessions 
                    SET status = 'failed', error_message = ?
                    WHERE id = ?
                """, (str(e)[:500], scheduled_session_id))
                conn.commit()
                logger.warning("   Scheduled session marked as 'failed'")
            except:
                pass
            
            # Don't raise - continue with next session
            logger.warning("   Continuing with next scheduled session...\n")
    
    def run(self):
        """
        Main scheduler loop
        - Allocates sessions daily at 00:01
        - Checks for due sessions every 5 minutes
        """
        logger.info("Starting session scheduler...")
        logger.info(f"Check interval: {self.settings.ig_scheduler_check_interval} seconds")
        
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
                    # New day! Allocate sessions
                    self.allocate_daily_sessions()
                    
                    # Clean up old sessions (keep last 7 days)
                    self.db.clear_old_scheduled_sessions(days_old=7)
                
                # Check for due sessions
                self.check_and_run_due_sessions()
                
                # Sleep until next check
                logger.debug(f"Next check in {self.settings.ig_scheduler_check_interval}s")
                time.sleep(self.settings.ig_scheduler_check_interval)
            
            except KeyboardInterrupt:
                logger.info("Scheduler stopped by user")
                break
            
            except Exception as e:
                logger.error(f"Scheduler error: {e}", exc_info=True)
                # Continue running even if there's an error
                time.sleep(60)  # Wait 1 minute before retry


def run_scheduler():
    """Entry point for scheduler"""
    from config import get_settings
    
    settings = get_settings()
    db_path = settings.get_database_path()
    db_manager = DatabaseManager(db_path)
    
    scheduler = SessionScheduler(db_manager)
    scheduler.run()


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    run_scheduler()

