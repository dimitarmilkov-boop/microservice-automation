# Instagram Engagement Service

Automated Instagram engagement for testing comment liking strategies.

## Overview

This service automates the following workflow:
1. Launch GoLogin profiles (locally)
2. Open random Instagram accounts from a target list
3. Find recent posts on each account
4. Like top 3-5 comments on each post
5. Track processed posts to avoid duplication
6. Enforce daily like limits (30 likes/day per profile)

## Quick Start

### Prerequisites
- GoLogin profiles already logged into Instagram
- Python 3.11+
- Target accounts list in `ig_targets.txt`

### Setup

```bash
# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables in root .env
# Set IG_PROFILES, IG_DAILY_LIKE_LIMIT, etc.
```

### Run CLI Script

```bash
# From project root
python services/ig-engagement-service/ig_liker.py
```

The script will:
- Load GoLogin profiles from env
- Read target accounts from `ig_targets.txt`
- Start automation loop (runs until stopped with Ctrl+C)
- Log all activities to `ig_engagement.db`

## Configuration

Edit `.env` in project root:

```ini
# Comma-separated GoLogin profile names
IG_PROFILES=profile1,profile2,profile3

# Daily limit per profile
IG_DAILY_LIKE_LIMIT=30

# Target accounts file
IG_TARGET_ACCOUNTS_FILE=ig_targets.txt

# Comments to like per post (min-max)
IG_COMMENTS_TO_LIKE_MIN=3
IG_COMMENTS_TO_LIKE_MAX=5

# Delays (human-like behavior)
IG_ACTION_DELAY_MIN=3
IG_ACTION_DELAY_MAX=7
```

## Target Accounts File

Create `ig_targets.txt` in project root:

```
username1
username2
username3
...
```

One Instagram username per line (without @ symbol).

## Database

SQLite database `ig_engagement.db` tracks:
- **processed_posts**: URLs of already-liked posts
- **daily_likes**: Like counts per profile per day
- **engagement_log**: Full activity log

## Logging

All actions are logged to:
- Console output
- `ig_engagement.db` database
- Structured JSON logs (if configured)

## Architecture

```
ig-engagement-service/
├── ig_liker.py              # Main CLI script
├── automation/              # Instagram automation logic
│   └── ig_automation.py
├── requirements.txt
└── README.md
```

Uses shared browser automation:
- `shared/browser_automation/gologin_manager.py`
- `shared/browser_automation/selenium_base.py`
- `shared/browser_automation/browser_profiles.py`

## Safety Features

- Daily like limits enforced
- Human-like random delays
- Processed posts tracking (skip duplicates)
- Graceful error handling
- Automatic session cleanup

## Stopping the Script

Press `Ctrl+C` to stop gracefully. The script will:
1. Complete current action
2. Save progress to database
3. Close browser sessions
4. Clean up resources

## Testing

Initial test mode (no automation, just browser launch):

```bash
# Test GoLogin profile launch
python services/ig-engagement-service/ig_liker.py --test
```

Should open Instagram in browser and display page title.

