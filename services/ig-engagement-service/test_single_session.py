"""
Quick test: Run a single automation session manually
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

# Load environment
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

from config import get_settings
from automation_worker import InstagramWorker
from shared.browser_automation import BrowserProfileManager

def main():
    print("\n" + "="*80)
    print("TESTING ALL 5 PROFILES")
    print("="*80 + "\n")
    
    settings = get_settings()
    profile_manager = BrowserProfileManager()
    
    all_results = []
    
    # Loop through all 5 profiles
    for i, profile_name in enumerate(settings.profile_names, 1):
        print(f"\n{'='*80}")
        print(f"PROFILE {i}/5: {profile_name}")
        print(f"{'='*80}\n")
        
        profile_id = profile_manager.get_profile_id_by_name(profile_name)
        
        print(f"Profile ID: {profile_id}")
        print(f"Target: 5 posts × 3 likes = 15 likes\n")
        
        try:
            # Create worker
            worker = InstagramWorker(
                profile_id=profile_id,
                profile_name=profile_name,
                settings=settings
            )
            
            # Run session
            result = worker.run_session(posts_target=5)
            
            print("\n" + "-"*80)
            print(f"RESULTS FOR {profile_name}:")
            print(f"  Session ID: {result['session_id']}")
            print(f"  Posts processed: {result['posts_processed']}")
            print(f"  Likes performed: {result['likes_performed']}")
            print(f"  Errors: {result['errors_count']}")
            print(f"  Duration: {result['duration']:.1f}s")
            print("-"*80 + "\n")
            
            all_results.append((profile_name, "✅ SUCCESS", result))
            
        except Exception as e:
            print(f"\n❌ ERROR for {profile_name}: {e}")
            all_results.append((profile_name, f"❌ ERROR: {e}", None))
        
        # Wait between profiles
        if i < len(settings.profile_names):
            print("Waiting 10 seconds before next profile...\n")
            import time
            time.sleep(10)
    
    # Final summary
    print("\n" + "="*80)
    print("FINAL SUMMARY - ALL PROFILES")
    print("="*80)
    for profile_name, status, result in all_results:
        if result:
            print(f"{profile_name}: {status} - {result['likes_performed']} likes")
        else:
            print(f"{profile_name}: {status}")
    
    success_count = sum(1 for _, status, _ in all_results if "SUCCESS" in status)
    print(f"\nSuccess Rate: {success_count}/{len(settings.profile_names)}")
    print("="*80 + "\n")
    
    print("[OK] Test complete!")
    print("\nNow check:")
    print("  1. Database tables (sessions, daily_likes, engagement_log, processed_posts)")
    print("  2. Instagram to verify likes appeared")
    print("  3. Logs in services/ig-engagement-service/logs/")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

