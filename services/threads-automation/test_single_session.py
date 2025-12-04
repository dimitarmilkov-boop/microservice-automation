"""
Quick test: Run a single automation session manually (Threads)
Based on ig-engagement-service/test_single_session.py
"""
import os
import sys
import logging
from pathlib import Path

# Add paths
project_root = Path(__file__).parent.parent.parent.resolve()
service_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(service_dir))

# Load environment (Exact copy from IG service logic)
env_path = project_root / '.env'
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Import Threads components
from config import Config
from threads_worker import ThreadsWorker
from database import Database
from shared.browser_automation import BrowserProfileManager

def main():
    print("\n" + "="*80)
    print("TESTING THREADS AUTOMATION - SINGLE SESSION")
    print("="*80 + "\n")
    
    profile_manager = BrowserProfileManager()
    
    target_profile = "Debradavis7611"
    
    print(f"Looking up profile: {target_profile}...")
    profile_id = profile_manager.get_profile_id_by_name(target_profile)
    
    if not profile_id:
        print(f"Profile {target_profile} not found!")
        return

    print(f"Profile ID: {profile_id}")
    print("Starting worker...\n")
    
    try:
        db = Database()
        
        worker = ThreadsWorker(
            profile_id=profile_id,
            settings=Config.DEFAULT_SETTINGS,
            db=db
        )
        
        print("Launching automation loop...")
        worker.start()
        
        print("\n" + "-"*80)
        print("SESSION FINISHED")
        print(f"  Stats: {worker.stats}")
        print("-" * 80 + "\n")
        
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\nError: {e}")
