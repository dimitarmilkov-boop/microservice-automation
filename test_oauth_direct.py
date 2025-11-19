"""
Direct test of OAuth automation - will show all output
"""
import sys
from pathlib import Path

# Add paths
sys.path.insert(0, str(Path(__file__).parent / "services" / "x-auth-service"))
sys.path.insert(0, str(Path(__file__).parent))

sys.path.insert(0, str(Path(__file__).parent / "services" / "x-auth-service" / "app"))
from automation.selenium_oauth_automation import SeleniumOAuthAutomator
import os

print("=" * 80)
print("DIRECT OAUTH AUTOMATION TEST")
print("=" * 80)

# Get environment variables
gologin_token = os.getenv("GOLOGIN_TOKEN")
if not gologin_token:
    print("ERROR: GOLOGIN_TOKEN not set!")
    sys.exit(1)

print(f"✓ GOLOGIN_TOKEN loaded: {gologin_token[:20]}...")

# Set up database path
db_path = Path(__file__).parent / "twitter_accounts.db"
print(f"✓ Database path: {db_path}")
print(f"✓ Database exists: {db_path.exists()}")

# Create automator
print("\nCreating SeleniumOAuthAutomator...")
automator = SeleniumOAuthAutomator(db_path=str(db_path), gologin_token=gologin_token)
print("✓ Automator created")

# Run OAuth flow
profile_id = "67c5c1981ffcfef21b40b20e"
api_app = "AIOTT1"

print(f"\nStarting OAuth automation:")
print(f"  Profile ID: {profile_id}")
print(f"  API App: {api_app}")
print()

result = automator.automate_oauth_for_profile(profile_id, api_app)

print("\n" + "=" * 80)
print("RESULT:")
print("=" * 80)
print(result)

