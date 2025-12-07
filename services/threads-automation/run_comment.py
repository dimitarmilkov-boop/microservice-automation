import sys
import os
import argparse
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(project_root))
service_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(service_dir))

# Load environment variables
env_path = project_root / '.env'
if not env_path.exists():
    desktop_env = Path(r"C:\Users\Dimitar\Desktop\automation_service\.env")
    if desktop_env.exists():
        env_path = desktop_env

if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

from threads_comment_worker import ThreadsCommentWorker
from shared.browser_automation.browser_profiles import BrowserProfileManager

def main():
    parser = argparse.ArgumentParser(description='Run Threads AI Commenter (White Panel)')
    parser.add_argument('--profile', type=str, help='GoLogin Profile Name (e.g. Gracecarroll5914) OR ID')
    
    args = parser.parse_args()
    
    # 1. Resolve Profile
    profile_input = args.profile
    if not profile_input:
        env_profiles = os.environ.get("GOLOGIN_THREADS_PROFILES", "")
        if env_profiles:
            profile_input = env_profiles.split(',')[0].strip()
        else:
            print("Error: No profile provided and GOLOGIN_THREADS_PROFILES not found in .env")
            return

    print(f"Resolving profile: {profile_input}...")
    profile_manager = BrowserProfileManager()
    
    # Check if input is already an ID (24 hex chars)
    profile_id = None
    if len(profile_input) == 24 and all(c in '0123456789abcdef' for c in profile_input.lower()):
        profile_id = profile_input
    else:
        profile_id = profile_manager.get_profile_id_by_name(profile_input)
        
    if not profile_id:
        print(f"Error: Could not find profile with name '{profile_input}'")
        return

    # 2. Start Worker
    print(f"Starting Comment Worker for profile {profile_input} ({profile_id})")
    worker = ThreadsCommentWorker(profile_id)
    worker.start()

if __name__ == "__main__":
    main()

