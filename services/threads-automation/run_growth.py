import sys
import os
import argparse
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(project_root))

# Add service directory to path (to fix import issues with hyphens)
service_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(service_dir))

# Load environment variables (standard pattern)
env_path = project_root / '.env'

# Fallback for Worktree environment
if not env_path.exists():
    desktop_env = Path(r"C:\Users\Dimitar\Desktop\automation_service\.env")
    if desktop_env.exists():
        env_path = desktop_env
        print(f"Loading .env from fallback: {env_path}")

if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

from threads_growth_worker import ThreadsGrowthWorker
from shared.browser_automation.browser_profiles import BrowserProfileManager

def main():
    parser = argparse.ArgumentParser(description='Run Threads Growth Worker (Targeted Follow)')
    parser.add_argument('--profile', type=str, help='GoLogin Profile Name (e.g. Debradavis7611) OR ID')
    parser.add_argument('--target', type=str, required=True, help='Target username to steal followers from (e.g. zuck)')
    
    args = parser.parse_args()
    
    # Resolve Profile ID
    profile_input = args.profile
    profile_id = None
    
    if not profile_input:
        # Default to first profile in .env if not provided
        env_profiles = os.environ.get("GOLOGIN_THREADS_PROFILES", "")
        if env_profiles:
            first_profile_name = env_profiles.split(',')[0].strip()
            print(f"No profile arg provided. Using first from .env: {first_profile_name}")
            profile_input = first_profile_name
        else:
            print("Error: No profile provided and GOLOGIN_THREADS_PROFILES not found in .env")
            return

    # Try to resolve name -> ID
    profile_manager = BrowserProfileManager()
    print(f"Resolving profile: {profile_input}...")
    
    # simple check if it looks like an ID (24 chars, hex) vs name
    if len(profile_input) == 24 and all(c in '0123456789abcdef' for c in profile_input.lower()):
        profile_id = profile_input
    else:
        profile_id = profile_manager.get_profile_id_by_name(profile_input)
    
    if not profile_id:
        print(f"Error: Could not find profile ID for '{profile_input}'")
        return

    target = args.target.strip().lstrip('@')
    
    print(f"Starting Growth Worker for profile {profile_input} ({profile_id}) on target @{target}")
    
    worker = ThreadsGrowthWorker(profile_id=profile_id, target_username=target)
    worker.start()

if __name__ == "__main__":
    main()
