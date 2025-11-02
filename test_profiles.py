#!/usr/bin/env python3
"""Test script to verify Instagram GoLogin profiles from .env"""

import os
import sys
from pathlib import Path

project_root = Path(__file__).parent.resolve()
sys.path.insert(0, str(project_root))

# Load env manually
env_path = project_root / '.env'
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

from shared.browser_automation import BrowserProfileManager

try:
    print("Testing Instagram GoLogin Profiles")
    print("=" * 70)
    
    # Get IG profiles from .env
    ig_profiles_str = os.getenv('GOLOGIN_IG_PROFILES', '')
    if not ig_profiles_str:
        print("\n[ERROR] GOLOGIN_IG_PROFILES not found in .env file!")
        print("Please add: GOLOGIN_IG_PROFILES=profile1,profile2,...")
        sys.exit(1)
    
    ig_profiles = [p.strip() for p in ig_profiles_str.split(',') if p.strip()]
    print(f"\nFound in .env: {len(ig_profiles)} profiles")
    print("-" * 70)
    
    # Fetch all available profiles from GoLogin
    manager = BrowserProfileManager()
    all_profiles = manager.list_profile_names()
    
    if not all_profiles:
        print("\n[ERROR] Could not fetch profiles from GoLogin API!")
        sys.exit(1)
    
    # Verify each IG profile
    found_count = 0
    missing_count = 0
    
    for i, profile_name in enumerate(ig_profiles, 1):
        if profile_name in all_profiles:
            print(f"  {i}. {profile_name:<30} [OK] Found in GoLogin")
            found_count += 1
        else:
            print(f"  {i}. {profile_name:<30} [ERROR] NOT FOUND!")
            missing_count += 1
    
    print("-" * 70)
    
    if missing_count == 0:
        print(f"\n[SUCCESS] All {found_count} profiles verified! Ready for automation.")
        print(f"\nTotal GoLogin profiles in account: {len(all_profiles)}")
    else:
        print(f"\n[WARNING] {found_count} profiles found, {missing_count} missing!")
        print("\nMissing profiles need to be created in GoLogin app.")
        sys.exit(1)
        
except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

