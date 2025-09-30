"""
Check GoLogin Profiles Available in Account
Uses GOLOGIN_TOKEN from .env to fetch all profiles via GoLogin API
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load .env from x-auth-service directory
env_path = Path(__file__).parent.parent / 'services' / 'x-auth-service' / '.env'

# Fix BOM encoding issue - read and set manually
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:  # utf-8-sig strips BOM
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

print(f"[DEBUG] Loading .env from: {env_path}")
print(f"[DEBUG] .env exists: {env_path.exists()}")

def fetch_gologin_profiles():
    """Fetch all profiles from GoLogin API using token."""
    
    token = os.getenv('GOLOGIN_TOKEN')
    print(f"[DEBUG] os.environ has GOLOGIN_TOKEN: {'GOLOGIN_TOKEN' in os.environ}")
    print(f"[DEBUG] Token value: {token}")
    
    if not token:
        print("[ERROR] GOLOGIN_TOKEN not found in .env file!")
        print("[DEBUG] Available env vars:", [k for k in os.environ.keys() if 'GOLOGIN' in k or 'TOKEN' in k])
        return None
    
    print(f"[TOKEN] Found: {token[:50]}...")
    print("\n[API] Fetching profiles from GoLogin...")
    
    # GoLogin API endpoint (v2)
    url = "https://api.gologin.com/browser/v2"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Handle dict response (might have 'profiles' key)
            if isinstance(data, dict):
                print(f"\n[DEBUG] Got dict response, keys: {list(data.keys())[:10]}")
                
                # Extract the actual profiles
                if 'profiles' in data:
                    profiles = data['profiles']
                    total_count = data.get('allProfilesCount', len(profiles))
                    print(f"\n[SUCCESS] Found {total_count} total profiles in your GoLogin account!")
                    print(f"[INFO] Showing {len(profiles)} profiles in current response\n")
                    
                    # If profiles is a list
                    if isinstance(profiles, list):
                        print("=" * 80)
                        print(f"{'ID':<40} {'NAME':<30} {'STATUS':<10}")
                        print("=" * 80)
                        for profile in profiles[:20]:  # Show first 20
                            if isinstance(profile, dict):
                                profile_id = profile.get('id', 'N/A')
                                profile_name = profile.get('name', 'Unnamed')
                                status = 'Active' if not profile.get('archived', False) else 'Archived'
                                print(f"{profile_id:<40} {profile_name:<30} {status:<10}")
                        if len(profiles) > 20:
                            print(f"... and {len(profiles) - 20} more profiles")
                        print("=" * 80)
                        return profiles
                    
                    # If profiles is a dict of profile_id -> profile_data
                    elif isinstance(profiles, dict):
                        profile_list = list(profiles.items())
                        print("=" * 80)
                        print(f"{'PROFILE ID':<50} {'COUNT':<10}")
                        print("=" * 80)
                        for i, (pid, pdata) in enumerate(profile_list[:20]):
                            print(f"{pid:<50}")
                        if len(profile_list) > 20:
                            print(f"... and {len(profile_list) - 20} more profiles")
                        print("=" * 80)
                        return profile_list
                
                # Fallback: just show dict keys
                profiles = list(data.keys())
                print(f"\n[SUCCESS] Found {len(profiles)} keys in response\n")
                return data
            
            # Handle list response
            profiles = data
            
            # Handle if response is list of IDs (strings)
            if profiles and isinstance(profiles[0], str):
                print(f"\n[SUCCESS] Found {len(profiles)} profile IDs!\n")
                print("=" * 80)
                print(f"PROFILE IDs")
                print("=" * 80)
                for pid in profiles:
                    print(f"  {pid}")
                print("=" * 80)
                return profiles
            
            # Handle normal profile objects
            print(f"\n[SUCCESS] Found {len(profiles)} profiles in your GoLogin account!\n")
            
            print("=" * 80)
            print(f"{'ID':<40} {'NAME':<30} {'STATUS':<10}")
            print("=" * 80)
            
            for profile in profiles:
                profile_id = profile.get('id', 'N/A')
                profile_name = profile.get('name', 'Unnamed')
                status = 'Active' if not profile.get('archived', False) else 'Archived'
                
                print(f"{profile_id:<40} {profile_name:<30} {status:<10}")
            
            print("=" * 80)
            print(f"\nTotal Active Profiles: {sum(1 for p in profiles if not p.get('archived', False))}")
            print(f"Total Archived Profiles: {sum(1 for p in profiles if p.get('archived', False))}")
            
            return profiles
        
        elif response.status_code == 401:
            print("[ERROR] Unauthorized - Invalid GOLOGIN_TOKEN!")
            print("Check if your token is correct in .env file")
            return None
        
        else:
            print(f"[ERROR] API returned status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    
    except Exception as e:
        print(f"[ERROR] Failed to fetch profiles: {e}")
        import traceback
        traceback.print_exc()
        return None

def show_profile_details(profiles, limit=3):
    """Show detailed info for first few profiles."""
    if not profiles:
        return
    
    # Handle if profiles is a list of tuples (from dict.items())
    if isinstance(profiles, list) and len(profiles) > 0:
        if isinstance(profiles[0], tuple):
            # List of (profile_id, profile_data) tuples
            print("\n" + "=" * 80)
            print(f"SAMPLE PROFILES (First {min(limit, len(profiles))})")
            print("=" * 80)
            for i, (pid, pdata) in enumerate(profiles[:limit]):
                print(f"\n--- PROFILE {i+1} ---")
                print(f"ID: {pid}")
                if isinstance(pdata, dict):
                    print(f"Name: {pdata.get('name', 'N/A')}")
                    print(f"Created: {pdata.get('createdAt', 'N/A')}")
            return
        
        elif isinstance(profiles[0], dict):
            # List of profile dicts
            print("\n" + "=" * 80)
            print(f"DETAILED INFO (First {min(limit, len(profiles))} Profiles)")
            print("=" * 80)
            for i, profile in enumerate(profiles[:limit]):
                print(f"\n--- PROFILE {i+1} ---")
                print(f"ID: {profile.get('id')}")
                print(f"Name: {profile.get('name')}")
                print(f"OS: {profile.get('os', 'N/A')}")
                print(f"Browser Type: {profile.get('browserType', 'N/A')}")
                print(f"Created: {profile.get('createdAt', 'N/A')}")
                print(f"Archived: {profile.get('archived', False)}")
            return
    
    # Handle dict response
    if isinstance(profiles, dict):
        print("\n[INFO] Profiles data is available as dict")

def main():
    print("=" * 80)
    print("GOLOGIN PROFILE CHECKER")
    print("=" * 80)
    
    profiles = fetch_gologin_profiles()
    
    if profiles:
        show_profile_details(profiles)
        
        print("\n" + "=" * 80)
        print("READY TO USE!")
        print("=" * 80)
        print("\nPick any profile_id from the list above to test the microservice.")
        
        # Get a sample profile_id
        sample_id = None
        if isinstance(profiles, list) and len(profiles) > 0:
            if isinstance(profiles[0], tuple):
                sample_id = profiles[0][0]  # From (id, data) tuple
            elif isinstance(profiles[0], dict):
                sample_id = profiles[0].get('id')
            elif isinstance(profiles[0], str):
                sample_id = profiles[0]
        
        if sample_id:
            print("\nExample:")
            print(f'  profile_id = "{sample_id}"')
        else:
            print("\nExample:")
            print('  profile_id = "YOUR-PROFILE-ID-HERE"')
    else:
        print("\n[FAILED] Could not fetch profiles. Check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
