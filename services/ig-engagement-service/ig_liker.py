#!/usr/bin/env python3
"""
Instagram Comment Liker - CLI Application

Automated Instagram comment liking with random session scheduling.
Continuously runs in the background, processing sessions throughout the day.

Usage:
    python services/ig-engagement-service/ig_liker.py           # Run scheduler
    python services/ig-engagement-service/ig_liker.py --test    # Test mode
"""

import os
import sys
import logging
import argparse
from pathlib import Path

# Add project root and service directory to Python path
project_root = Path(__file__).parent.parent.parent.resolve()
service_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(service_dir))

# Load environment variables manually (BOM-safe)
env_path = project_root / '.env'
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

# Import service modules
from config import get_settings
from database import DatabaseManager
from scheduler import SessionScheduler
from shared.browser_automation import BrowserProfileManager

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


class InstagramLiker:
    """Instagram automated engagement CLI application."""
    
    def __init__(self):
        """Initialize the Instagram liker."""
        self.logger = logging.getLogger(__name__)
        
        self.logger.info("=" * 80)
        self.logger.info("Instagram Comment Liker Starting...")
        self.logger.info("=" * 80)
        
        # Load configuration
        self.settings = get_settings()
        
        # Initialize database
        self.db_path = self.settings.get_database_path()
        self.db_manager = DatabaseManager(self.db_path)
        
        # Initialize scheduler
        self.scheduler = SessionScheduler(self.db_manager)
        
        self.logger.info(f"Configuration loaded:")
        self.logger.info(f"  - Profiles: {len(self.settings.profile_names)}")
        self.logger.info(f"  - Daily limit: {self.settings.ig_daily_like_limit} likes/profile")
        self.logger.info(f"  - Sessions per profile: {self.settings.sessions_per_profile}")
        self.logger.info(f"  - Posts per session: {self.settings.ig_posts_per_session}")
        self.logger.info(f"  - Comments per post: {self.settings.ig_comments_to_like}")
        self.logger.info(f"  - Database: {self.db_path}")
    
    def run_test(self):
        """
        Test mode: Verify configuration and run a single test session
        """
        self.logger.info("\n" + "=" * 80)
        self.logger.info("RUNNING IN TEST MODE")
        self.logger.info("=" * 80 + "\n")
        
        # Verify profiles
        profile_manager = BrowserProfileManager()
        
        self.logger.info("Verifying Instagram profiles...")
        for profile_name in self.settings.profile_names:
            profile_id = profile_manager.get_profile_id_by_name(profile_name)
            if profile_id:
                self.logger.info(f"  [OK] {profile_name} -> {profile_id}")
            else:
                self.logger.error(f"  [ERROR] {profile_name} NOT FOUND!")
                return False
        
        # Verify target accounts file
        target_file = self.settings.get_target_accounts_path()
        if not target_file.exists():
            self.logger.error(f"Target accounts file not found: {target_file}")
            return False
        
        with open(target_file, 'r') as f:
            accounts = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        
        self.logger.info(f"\nTarget accounts file: {target_file}")
        self.logger.info(f"  - Found {len(accounts)} accounts")
        
        # Show calculated session info
        self.logger.info(f"\nSession calculations:")
        self.logger.info(f"  - Daily limit: {self.settings.ig_daily_like_limit} likes")
        self.logger.info(f"  - Comments per post: {self.settings.ig_comments_to_like}")
        self.logger.info(f"  - Posts per session: {self.settings.ig_posts_per_session}")
        self.logger.info(f"  - Sessions per profile: {self.settings.sessions_per_profile}")
        
        self.logger.info("\n" + "=" * 80)
        self.logger.info("TEST PASSED - Configuration Valid!")
        self.logger.info("=" * 80)
        self.logger.info("\nReady to run full automation with:")
        self.logger.info(f"  python {Path(__file__).name}")
        
        return True
    
    def run(self):
        """
        Main automation loop - run scheduler continuously
        """
        self.logger.info("\n" + "=" * 80)
        self.logger.info("STARTING AUTOMATION SCHEDULER")
        self.logger.info("=" * 80 + "\n")
        
        self.logger.info("Scheduler will:")
        self.logger.info("  1. Allocate random session times daily (at 00:01)")
        self.logger.info("  2. Check every 5 minutes for due sessions")
        self.logger.info("  3. Run automation when sessions are due")
        self.logger.info("  4. Track all activities in database")
        self.logger.info("\nPress Ctrl+C to stop...")
        self.logger.info("")
        
        try:
            # Run scheduler (infinite loop)
            self.scheduler.run()
            return True
        
        except KeyboardInterrupt:
            self.logger.info("\nScheduler stopped by user")
            return True


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Instagram Auto-Liker CLI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python ig_liker.py --test    # Test mode (launch browser only)
  python ig_liker.py           # Full automation (not implemented yet)
        """
    )
    
    parser.add_argument(
        '--test',
        action='store_true',
        help='Run in test mode (launch browser, open Instagram, exit)'
    )
    
    args = parser.parse_args()
    
    try:
        liker = InstagramLiker()
        
        if args.test:
            success = liker.run_test()
        else:
            success = liker.run()
        
        sys.exit(0 if success else 1)
    
    except KeyboardInterrupt:
        print("\n\nInterrupted by user. Exiting...")
        sys.exit(0)
    
    except Exception as e:
        logging.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()

