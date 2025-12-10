# Threads Automation Guide

> **Status:** ✅ Full-featured with Web UI and Scheduler

---

## Overview

This service automates Threads engagement using Python + Selenium + GoLogin:

- **Dark Panel** = Targeted Follow (follow users from a target's Following list)
- **White Panel** = AI Commenter (like + comment on feed posts with AI-generated replies)
- **Web UI** = Control panel to manage workers, view logs, and schedule sessions
- **Scheduler** = Automatic morning + evening sessions

---

## Quick Start

### 1. Start the Web Server

```bash
cd services/threads-automation
python server.py
```

Open http://localhost:8000 in your browser.

### 2. Configure `.env`

```env
# Required
GOLOGIN_TOKEN=your_gologin_api_token
GOLOGIN_THREADS_PROFILES=Debradavis7611,Gracecarroll5914,Amywelch9403

# For AI Comments
OPENAI_API_KEY=sk-...

# For auto-scheduling (optional)
THREADS_DEFAULT_TARGET=zuck
```

### 3. Run Manually or Schedule

**Option A: Manual (from Web UI)**

1. Select a GoLogin profile
2. Enter target username (e.g., `zuck`)
3. Click "Run Growth Now (Session 1)"
4. Session 2 auto-schedules 6 hours later

**Option B: Auto-Schedule**

- On server startup, morning (10:00) + evening (18:00) sessions are auto-scheduled
- Uses profiles from `GOLOGIN_THREADS_PROFILES`
- Uses target from `THREADS_DEFAULT_TARGET`

---

## ✅ Completed Features

### 1. Web UI (Control Panel)

**File:** `server.py` + `templates/index.html`

| Feature                                                     | Status |
| ----------------------------------------------------------- | ------ |
| FastAPI web server on port 8000                             | ✅     |
| Profile selector dropdown (from GoLogin)                    | ✅     |
| "Run Growth Now" button with target input                   | ✅     |
| "Run Commenter Now" button                                  | ✅     |
| Growth Scheduler with explicit times                        | ✅     |
| Live Action Log (Manual Refresh)                            | ✅     |
| Recent Sessions table (profile name, type, results)         | ✅     |
| Upcoming Sessions list with delete button                   | ✅     |
| Configuration editors (growth_config.py, comment_config.py) | ✅     |
| Profile cache at startup (no lookup spam)                   | ✅     |

### 2. Scheduler

**File:** `server.py` (scheduler_loop function)

| Feature                                                      | Status |
| ------------------------------------------------------------ | ------ |
| Auto-schedule on manual run (Session 2 after 6 hours)        | ✅     |
| Auto-schedule daily sessions (morning 10:00 + evening 18:00) | ✅     |
| Uses `GOLOGIN_THREADS_PROFILES` from .env                    | ✅     |
| Uses `THREADS_DEFAULT_TARGET` for auto-scheduled sessions    | ✅     |
| Scheduler loop checks every 60 seconds                       | ✅     |
| Per-profile mutex (skip if worker already running)           | ✅     |
| Schedule via UI with explicit times (HH:MM)                  | ✅     |
| Validates growth tasks have target_username                  | ✅     |

### 3. Targeted Growth (Dark Panel)

**Files:** `threads_growth_worker.py`, `run_growth.py`, `growth_config.py`

| Feature                                                            | Status |
| ------------------------------------------------------------------ | ------ |
| Navigate to target profile                                         | ✅     |
| Open Followers/Following modal                                     | ✅     |
| Switch to "Following" tab                                          | ✅     |
| Incremental scrolling (300-500px)                                  | ✅     |
| Find one Follow button at a time (avoids stale elements)           | ✅     |
| **Human Protocol** hover + click                                   | ✅     |
| **Verify follow worked** (check button changed to "Following")     | ✅     |
| **Safety Valve** (1 rejected follow = stop session)                | ✅     |
| **Imperfect Timing** (15-60 seconds between follows)               | ✅     |
| **Coffee Breaks** (2-5m every ~5 follows)                          | ✅     |
| Skip already-followed users (DB check per profile)                 | ✅     |
| Log follows to `engagement_log` table                              | ✅     |
| Session continuation (Session 2 picks up where Session 1 left off) | ✅     |

### 4. AI Commenter (White Panel)

**Files:** `threads_comment_worker.py`, `run_comment.py`, `comment_config.py`, `core/ai_generator.py`

| Feature                                            | Status |
| -------------------------------------------------- | ------ |
| Navigate to "For You" feed                         | ✅     |
| Detect posts using Reply buttons                   | ✅     |
| Extract post text (robust `[dir="auto"]` strategy) | ✅     |
| Filter spam/link-farm posts                        | ✅     |
| Skip already-commented posts (DB check)            | ✅     |
| Like post before commenting                        | ✅     |
| Click Reply button                                 | ✅     |
| **Handle BOTH modal and inline reply**             | ✅     |
| **Use active_element for focused input**           | ✅     |
| Generate context-aware AI comment (OpenAI/Groq)    | ✅     |
| Human-like typing simulation                       | ✅     |
| Submit comment (Post button or Enter fallback)     | ✅     |
| **Hard stop when goal reached**                    | ✅     |
| Emoji/special character stripping                  | ✅     |
| Log comments to `engagement_log` table             | ✅     |

### 5. Database

**File:** `database.py`

| Table             | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `sessions`        | Track worker sessions (start/end time, status, stats)      |
| `engagement_log`  | Log every action (follow, like, comment) with username/URL |
| `daily_limits`    | Track daily counts per profile                             |
| `scheduled_tasks` | Store scheduled sessions with target_username              |

---

## Configuration

### `growth_config.py` (Human Protocol)

```python
GROWTH_SETTINGS = {
    "max_follows_per_session": 15,    # Safe limit per session
    "max_rejections": 1,              # STOP if 1 follow is rejected
    "delay_min": 15,                  # Min seconds between follows
    "delay_max": 60,                  # Max seconds between follows
    "enable_breaks": True,            # Enable coffee breaks
    "break_every_min": 4,             # Break every 4-7 follows
    "break_duration_min": 120,        # Break for 2-5 minutes
    "verify_follow": True,            # Check if follow actually worked
    "hover_before_click": True,       # Human-like hover before clicking
}
```

---

## How Session Continuation Works

When you run Growth targeting `@zuck`:

1. **Session 1 (10:00 AM):** Follows 15 users from zuck's Following list
2. **Session 2 (4:00 PM):** Opens same target, but:
   - Users already showing "Following" button are skipped (Threads UI)
   - Users in `engagement_log` with `action_type=follow` are skipped (our DB)
   - Effectively continues from where Session 1 left off
3. **Result:** ~30-45 follows/day split across 2-3 human-like sessions

---

## Troubleshooting

### Profile lookup spam in terminal
**Fixed:** Profiles are cached at startup. If you still see spam, restart the server.

### "Stale element reference" errors
**Fixed:** Worker finds one button at a time and re-queries the DOM each iteration.

### Follows getting rejected
**Normal:** Threads rate limits. The bot detects this (Safety Valve) and pauses. **Wait 1-2 hours before retrying.**

### Sessions not running automatically
**Check:**
1. `GOLOGIN_THREADS_PROFILES` is set in `.env`
2. `THREADS_DEFAULT_TARGET` is set in `.env`
3. Server is running (`python server.py`)

---

## Changelog

### 2024-12-09
- ✅ **AI Commenter Fully Working:**
  - Fixed input finding (uses `active_element` - Threads auto-focuses reply input)
  - Handles BOTH modal and inline reply scenarios
  - Proper goal enforcement (hard stop when limit reached)
  - Posts Reply buttons → get parent post → like + comment
- ✅ **Debugging methodology:**
  - JS debug scripts to analyze Threads DOM
  - Identified inline vs modal reply behavior

### 2024-12-08
- ✅ **Human Protocol Implementation:**
  - Safety Valve (Stop on 1 rejection)
  - Imperfect Timing (15-60s delays)
  - Coffee Breaks (2-5m pause)
  - Verification logic rewritten
- ✅ **Web UI Fixes:**
  - Restored Target Username input
  - Manual Log Refresh button
  - Corrected Session history display
- ✅ **Database Maintenance:**
  - `backfill_sessions.py` to fix historical data
  - `wipe_db.py` for clean slate
- ✅ **Auto-Schedule:** 6-hour follow-up for manual sessions

### 2024-12-07
- ✅ Fixed AI comment context
- ✅ Added emoji stripping
- ✅ Improved post text extraction
- ✅ Human-like behavior (hover, random delays, long breaks)
- ✅ Incremental scrolling (avoids stale elements)

### 2024-12-06
- ✅ Implemented Dark Panel (Targeted Follow)
- ✅ Implemented White Panel (AI Commenter)
- ✅ Database logging and deduplication
- ✅ GoLogin integration


> **Status:** ✅ Full-featured with Web UI and Scheduler

---

## Overview

This service automates Threads engagement using Python + Selenium + GoLogin:

- **Dark Panel** = Targeted Follow (follow users from a target's Following list)
- **White Panel** = AI Commenter (like + comment on feed posts with AI-generated replies)
- **Web UI** = Control panel to manage workers, view logs, and schedule sessions
- **Scheduler** = Automatic morning + evening sessions

---

## Quick Start

### 1. Start the Web Server

```bash
cd services/threads-automation
python server.py
```

Open http://localhost:8000 in your browser.

### 2. Configure `.env`

```env
# Required
GOLOGIN_TOKEN=your_gologin_api_token
GOLOGIN_THREADS_PROFILES=Debradavis7611,Gracecarroll5914,Amywelch9403

# For AI Comments
OPENAI_API_KEY=sk-...

# For auto-scheduling (optional)
THREADS_DEFAULT_TARGET=zuck
```

### 3. Run Manually or Schedule

**Option A: Manual (from Web UI)**

1. Select a GoLogin profile
2. Enter target username (e.g., `zuck`)
3. Click "Run Growth Now (Session 1)"
4. Session 2 auto-schedules 6 hours later

**Option B: Auto-Schedule**

- On server startup, morning (10:00) + evening (18:00) sessions are auto-scheduled
- Uses profiles from `GOLOGIN_THREADS_PROFILES`
- Uses target from `THREADS_DEFAULT_TARGET`

---

## ✅ Completed Features

### 1. Web UI (Control Panel)

**File:** `server.py` + `templates/index.html`

| Feature                                                     | Status |
| ----------------------------------------------------------- | ------ |
| FastAPI web server on port 8000                             | ✅     |
| Profile selector dropdown (from GoLogin)                    | ✅     |
| "Run Growth Now" button with target input                   | ✅     |
| "Run Commenter Now" button                                  | ✅     |
| Growth Scheduler with explicit times                        | ✅     |
| Live Action Log (Manual Refresh)                            | ✅     |
| Recent Sessions table (profile name, type, results)         | ✅     |
| Upcoming Sessions list with delete button                   | ✅     |
| Configuration editors (growth_config.py, comment_config.py) | ✅     |
| Profile cache at startup (no lookup spam)                   | ✅     |

### 2. Scheduler

**File:** `server.py` (scheduler_loop function)

| Feature                                                      | Status |
| ------------------------------------------------------------ | ------ |
| Auto-schedule on manual run (Session 2 after 6 hours)        | ✅     |
| Auto-schedule daily sessions (morning 10:00 + evening 18:00) | ✅     |
| Uses `GOLOGIN_THREADS_PROFILES` from .env                    | ✅     |
| Uses `THREADS_DEFAULT_TARGET` for auto-scheduled sessions    | ✅     |
| Scheduler loop checks every 60 seconds                       | ✅     |
| Per-profile mutex (skip if worker already running)           | ✅     |
| Schedule via UI with explicit times (HH:MM)                  | ✅     |
| Validates growth tasks have target_username                  | ✅     |

### 3. Targeted Growth (Dark Panel)

**Files:** `threads_growth_worker.py`, `run_growth.py`, `growth_config.py`

| Feature                                                            | Status |
| ------------------------------------------------------------------ | ------ |
| Navigate to target profile                                         | ✅     |
| Open Followers/Following modal                                     | ✅     |
| Switch to "Following" tab                                          | ✅     |
| Incremental scrolling (300-500px)                                  | ✅     |
| Find one Follow button at a time (avoids stale elements)           | ✅     |
| **Human Protocol** hover + click                                   | ✅     |
| **Verify follow worked** (check button changed to "Following")     | ✅     |
| **Safety Valve** (1 rejected follow = stop session)                | ✅     |
| **Imperfect Timing** (15-60 seconds between follows)               | ✅     |
| **Coffee Breaks** (2-5m every ~5 follows)                          | ✅     |
| Skip already-followed users (DB check per profile)                 | ✅     |
| Log follows to `engagement_log` table                              | ✅     |
| Session continuation (Session 2 picks up where Session 1 left off) | ✅     |

### 4. AI Commenter (White Panel)

**Files:** `threads_comment_worker.py`, `run_comment.py`, `comment_config.py`, `core/ai_generator.py`

| Feature                                            | Status |
| -------------------------------------------------- | ------ |
| Navigate to "For You" feed                         | ✅     |
| Detect posts using Reply buttons                   | ✅     |
| Extract post text (robust `[dir="auto"]` strategy) | ✅     |
| Filter spam/link-farm posts                        | ✅     |
| Skip already-commented posts (DB check)            | ✅     |
| Like post before commenting                        | ✅     |
| Click Reply button                                 | ✅     |
| **Handle BOTH modal and inline reply**             | ✅     |
| **Use active_element for focused input**           | ✅     |
| Generate context-aware AI comment (OpenAI/Groq)    | ✅     |
| Human-like typing simulation                       | ✅     |
| Submit comment (Post button or Enter fallback)     | ✅     |
| **Hard stop when goal reached**                    | ✅     |
| Emoji/special character stripping                  | ✅     |
| Log comments to `engagement_log` table             | ✅     |

### 5. Database

**File:** `database.py`

| Table             | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `sessions`        | Track worker sessions (start/end time, status, stats)      |
| `engagement_log`  | Log every action (follow, like, comment) with username/URL |
| `daily_limits`    | Track daily counts per profile                             |
| `scheduled_tasks` | Store scheduled sessions with target_username              |

---

## Configuration

### `growth_config.py` (Human Protocol)

```python
GROWTH_SETTINGS = {
    "max_follows_per_session": 15,    # Safe limit per session
    "max_rejections": 1,              # STOP if 1 follow is rejected
    "delay_min": 15,                  # Min seconds between follows
    "delay_max": 60,                  # Max seconds between follows
    "enable_breaks": True,            # Enable coffee breaks
    "break_every_min": 4,             # Break every 4-7 follows
    "break_duration_min": 120,        # Break for 2-5 minutes
    "verify_follow": True,            # Check if follow actually worked
    "hover_before_click": True,       # Human-like hover before clicking
}
```

---

## How Session Continuation Works

When you run Growth targeting `@zuck`:

1. **Session 1 (10:00 AM):** Follows 15 users from zuck's Following list
2. **Session 2 (4:00 PM):** Opens same target, but:
   - Users already showing "Following" button are skipped (Threads UI)
   - Users in `engagement_log` with `action_type=follow` are skipped (our DB)
   - Effectively continues from where Session 1 left off
3. **Result:** ~30-45 follows/day split across 2-3 human-like sessions

---

## Troubleshooting

### Profile lookup spam in terminal
**Fixed:** Profiles are cached at startup. If you still see spam, restart the server.

### "Stale element reference" errors
**Fixed:** Worker finds one button at a time and re-queries the DOM each iteration.

### Follows getting rejected
**Normal:** Threads rate limits. The bot detects this (Safety Valve) and pauses. **Wait 1-2 hours before retrying.**

### Sessions not running automatically
**Check:**
1. `GOLOGIN_THREADS_PROFILES` is set in `.env`
2. `THREADS_DEFAULT_TARGET` is set in `.env`
3. Server is running (`python server.py`)

---

## Changelog

### 2024-12-09
- ✅ **AI Commenter Fully Working:**
  - Fixed input finding (uses `active_element` - Threads auto-focuses reply input)
  - Handles BOTH modal and inline reply scenarios
  - Proper goal enforcement (hard stop when limit reached)
  - Posts Reply buttons → get parent post → like + comment
- ✅ **Debugging methodology:**
  - JS debug scripts to analyze Threads DOM
  - Identified inline vs modal reply behavior

### 2024-12-08
- ✅ **Human Protocol Implementation:**
  - Safety Valve (Stop on 1 rejection)
  - Imperfect Timing (15-60s delays)
  - Coffee Breaks (2-5m pause)
  - Verification logic rewritten
- ✅ **Web UI Fixes:**
  - Restored Target Username input
  - Manual Log Refresh button
  - Corrected Session history display
- ✅ **Database Maintenance:**
  - `backfill_sessions.py` to fix historical data
  - `wipe_db.py` for clean slate
- ✅ **Auto-Schedule:** 6-hour follow-up for manual sessions

### 2024-12-07
- ✅ Fixed AI comment context
- ✅ Added emoji stripping
- ✅ Improved post text extraction
- ✅ Human-like behavior (hover, random delays, long breaks)
- ✅ Incremental scrolling (avoids stale elements)

### 2024-12-06
- ✅ Implemented Dark Panel (Targeted Follow)
- ✅ Implemented White Panel (AI Commenter)
- ✅ Database logging and deduplication
- ✅ GoLogin integration


> **Status:** ✅ Full-featured with Web UI and Scheduler

---

## Overview

This service automates Threads engagement using Python + Selenium + GoLogin:

- **Dark Panel** = Targeted Follow (follow users from a target's Following list)
- **White Panel** = AI Commenter (like + comment on feed posts with AI-generated replies)
- **Web UI** = Control panel to manage workers, view logs, and schedule sessions
- **Scheduler** = Automatic morning + evening sessions

---

## Quick Start

### 1. Start the Web Server

```bash
cd services/threads-automation
python server.py
```

Open http://localhost:8000 in your browser.

### 2. Configure `.env`

```env
# Required
GOLOGIN_TOKEN=your_gologin_api_token
GOLOGIN_THREADS_PROFILES=Debradavis7611,Gracecarroll5914,Amywelch9403

# For AI Comments
OPENAI_API_KEY=sk-...

# For auto-scheduling (optional)
THREADS_DEFAULT_TARGET=zuck
```

### 3. Run Manually or Schedule

**Option A: Manual (from Web UI)**

1. Select a GoLogin profile
2. Enter target username (e.g., `zuck`)
3. Click "Run Growth Now (Session 1)"
4. Session 2 auto-schedules 6 hours later

**Option B: Auto-Schedule**

- On server startup, morning (10:00) + evening (18:00) sessions are auto-scheduled
- Uses profiles from `GOLOGIN_THREADS_PROFILES`
- Uses target from `THREADS_DEFAULT_TARGET`

---

## ✅ Completed Features

### 1. Web UI (Control Panel)

**File:** `server.py` + `templates/index.html`

| Feature                                                     | Status |
| ----------------------------------------------------------- | ------ |
| FastAPI web server on port 8000                             | ✅     |
| Profile selector dropdown (from GoLogin)                    | ✅     |
| "Run Growth Now" button with target input                   | ✅     |
| "Run Commenter Now" button                                  | ✅     |
| Growth Scheduler with explicit times                        | ✅     |
| Live Action Log (Manual Refresh)                            | ✅     |
| Recent Sessions table (profile name, type, results)         | ✅     |
| Upcoming Sessions list with delete button                   | ✅     |
| Configuration editors (growth_config.py, comment_config.py) | ✅     |
| Profile cache at startup (no lookup spam)                   | ✅     |

### 2. Scheduler

**File:** `server.py` (scheduler_loop function)

| Feature                                                      | Status |
| ------------------------------------------------------------ | ------ |
| Auto-schedule on manual run (Session 2 after 6 hours)        | ✅     |
| Auto-schedule daily sessions (morning 10:00 + evening 18:00) | ✅     |
| Uses `GOLOGIN_THREADS_PROFILES` from .env                    | ✅     |
| Uses `THREADS_DEFAULT_TARGET` for auto-scheduled sessions    | ✅     |
| Scheduler loop checks every 60 seconds                       | ✅     |
| Per-profile mutex (skip if worker already running)           | ✅     |
| Schedule via UI with explicit times (HH:MM)                  | ✅     |
| Validates growth tasks have target_username                  | ✅     |

### 3. Targeted Growth (Dark Panel)

**Files:** `threads_growth_worker.py`, `run_growth.py`, `growth_config.py`

| Feature                                                            | Status |
| ------------------------------------------------------------------ | ------ |
| Navigate to target profile                                         | ✅     |
| Open Followers/Following modal                                     | ✅     |
| Switch to "Following" tab                                          | ✅     |
| Incremental scrolling (300-500px)                                  | ✅     |
| Find one Follow button at a time (avoids stale elements)           | ✅     |
| **Human Protocol** hover + click                                   | ✅     |
| **Verify follow worked** (check button changed to "Following")     | ✅     |
| **Safety Valve** (1 rejected follow = stop session)                | ✅     |
| **Imperfect Timing** (15-60 seconds between follows)               | ✅     |
| **Coffee Breaks** (2-5m every ~5 follows)                          | ✅     |
| Skip already-followed users (DB check per profile)                 | ✅     |
| Log follows to `engagement_log` table                              | ✅     |
| Session continuation (Session 2 picks up where Session 1 left off) | ✅     |

### 4. AI Commenter (White Panel)

**Files:** `threads_comment_worker.py`, `run_comment.py`, `comment_config.py`, `core/ai_generator.py`

| Feature                                            | Status |
| -------------------------------------------------- | ------ |
| Navigate to "For You" feed                         | ✅     |
| Detect posts using Reply buttons                   | ✅     |
| Extract post text (robust `[dir="auto"]` strategy) | ✅     |
| Filter spam/link-farm posts                        | ✅     |
| Skip already-commented posts (DB check)            | ✅     |
| Like post before commenting                        | ✅     |
| Click Reply button                                 | ✅     |
| **Handle BOTH modal and inline reply**             | ✅     |
| **Use active_element for focused input**           | ✅     |
| Generate context-aware AI comment (OpenAI/Groq)    | ✅     |
| Human-like typing simulation                       | ✅     |
| Submit comment (Post button or Enter fallback)     | ✅     |
| **Hard stop when goal reached**                    | ✅     |
| Emoji/special character stripping                  | ✅     |
| Log comments to `engagement_log` table             | ✅     |

### 5. Database

**File:** `database.py`

| Table             | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `sessions`        | Track worker sessions (start/end time, status, stats)      |
| `engagement_log`  | Log every action (follow, like, comment) with username/URL |
| `daily_limits`    | Track daily counts per profile                             |
| `scheduled_tasks` | Store scheduled sessions with target_username              |

---

## Configuration

### `growth_config.py` (Human Protocol)

```python
GROWTH_SETTINGS = {
    "max_follows_per_session": 15,    # Safe limit per session
    "max_rejections": 1,              # STOP if 1 follow is rejected
    "delay_min": 15,                  # Min seconds between follows
    "delay_max": 60,                  # Max seconds between follows
    "enable_breaks": True,            # Enable coffee breaks
    "break_every_min": 4,             # Break every 4-7 follows
    "break_duration_min": 120,        # Break for 2-5 minutes
    "verify_follow": True,            # Check if follow actually worked
    "hover_before_click": True,       # Human-like hover before clicking
}
```

---

## How Session Continuation Works

When you run Growth targeting `@zuck`:

1. **Session 1 (10:00 AM):** Follows 15 users from zuck's Following list
2. **Session 2 (4:00 PM):** Opens same target, but:
   - Users already showing "Following" button are skipped (Threads UI)
   - Users in `engagement_log` with `action_type=follow` are skipped (our DB)
   - Effectively continues from where Session 1 left off
3. **Result:** ~30-45 follows/day split across 2-3 human-like sessions

---

## Troubleshooting

### Profile lookup spam in terminal
**Fixed:** Profiles are cached at startup. If you still see spam, restart the server.

### "Stale element reference" errors
**Fixed:** Worker finds one button at a time and re-queries the DOM each iteration.

### Follows getting rejected
**Normal:** Threads rate limits. The bot detects this (Safety Valve) and pauses. **Wait 1-2 hours before retrying.**

### Sessions not running automatically
**Check:**
1. `GOLOGIN_THREADS_PROFILES` is set in `.env`
2. `THREADS_DEFAULT_TARGET` is set in `.env`
3. Server is running (`python server.py`)

---

## Changelog

### 2024-12-09
- ✅ **AI Commenter Fully Working:**
  - Fixed input finding (uses `active_element` - Threads auto-focuses reply input)
  - Handles BOTH modal and inline reply scenarios
  - Proper goal enforcement (hard stop when limit reached)
  - Posts Reply buttons → get parent post → like + comment
- ✅ **Debugging methodology:**
  - JS debug scripts to analyze Threads DOM
  - Identified inline vs modal reply behavior

### 2024-12-08
- ✅ **Human Protocol Implementation:**
  - Safety Valve (Stop on 1 rejection)
  - Imperfect Timing (15-60s delays)
  - Coffee Breaks (2-5m pause)
  - Verification logic rewritten
- ✅ **Web UI Fixes:**
  - Restored Target Username input
  - Manual Log Refresh button
  - Corrected Session history display
- ✅ **Database Maintenance:**
  - `backfill_sessions.py` to fix historical data
  - `wipe_db.py` for clean slate
- ✅ **Auto-Schedule:** 6-hour follow-up for manual sessions

### 2024-12-07
- ✅ Fixed AI comment context
- ✅ Added emoji stripping
- ✅ Improved post text extraction
- ✅ Human-like behavior (hover, random delays, long breaks)
- ✅ Incremental scrolling (avoids stale elements)

### 2024-12-06
- ✅ Implemented Dark Panel (Targeted Follow)
- ✅ Implemented White Panel (AI Commenter)
- ✅ Database logging and deduplication
- ✅ GoLogin integration


> **Status:** ✅ Full-featured with Web UI and Scheduler

---

## Overview

This service automates Threads engagement using Python + Selenium + GoLogin:

- **Dark Panel** = Targeted Follow (follow users from a target's Following list)
- **White Panel** = AI Commenter (like + comment on feed posts with AI-generated replies)
- **Web UI** = Control panel to manage workers, view logs, and schedule sessions
- **Scheduler** = Automatic morning + evening sessions

---

## Quick Start

### 1. Start the Web Server

```bash
cd services/threads-automation
python server.py
```

Open http://localhost:8000 in your browser.

### 2. Configure `.env`

```env
# Required
GOLOGIN_TOKEN=your_gologin_api_token
GOLOGIN_THREADS_PROFILES=Debradavis7611,Gracecarroll5914,Amywelch9403

# For AI Comments
OPENAI_API_KEY=sk-...

# For auto-scheduling (optional)
THREADS_DEFAULT_TARGET=zuck
```

### 3. Run Manually or Schedule

**Option A: Manual (from Web UI)**

1. Select a GoLogin profile
2. Enter target username (e.g., `zuck`)
3. Click "Run Growth Now (Session 1)"
4. Session 2 auto-schedules 6 hours later

**Option B: Auto-Schedule**

- On server startup, morning (10:00) + evening (18:00) sessions are auto-scheduled
- Uses profiles from `GOLOGIN_THREADS_PROFILES`
- Uses target from `THREADS_DEFAULT_TARGET`

---

## ✅ Completed Features

### 1. Web UI (Control Panel)

**File:** `server.py` + `templates/index.html`

| Feature                                                     | Status |
| ----------------------------------------------------------- | ------ |
| FastAPI web server on port 8000                             | ✅     |
| Profile selector dropdown (from GoLogin)                    | ✅     |
| "Run Growth Now" button with target input                   | ✅     |
| "Run Commenter Now" button                                  | ✅     |
| Growth Scheduler with explicit times                        | ✅     |
| Live Action Log (Manual Refresh)                            | ✅     |
| Recent Sessions table (profile name, type, results)         | ✅     |
| Upcoming Sessions list with delete button                   | ✅     |
| Configuration editors (growth_config.py, comment_config.py) | ✅     |
| Profile cache at startup (no lookup spam)                   | ✅     |

### 2. Scheduler

**File:** `server.py` (scheduler_loop function)

| Feature                                                      | Status |
| ------------------------------------------------------------ | ------ |
| Auto-schedule on manual run (Session 2 after 6 hours)        | ✅     |
| Auto-schedule daily sessions (morning 10:00 + evening 18:00) | ✅     |
| Uses `GOLOGIN_THREADS_PROFILES` from .env                    | ✅     |
| Uses `THREADS_DEFAULT_TARGET` for auto-scheduled sessions    | ✅     |
| Scheduler loop checks every 60 seconds                       | ✅     |
| Per-profile mutex (skip if worker already running)           | ✅     |
| Schedule via UI with explicit times (HH:MM)                  | ✅     |
| Validates growth tasks have target_username                  | ✅     |

### 3. Targeted Growth (Dark Panel)

**Files:** `threads_growth_worker.py`, `run_growth.py`, `growth_config.py`

| Feature                                                            | Status |
| ------------------------------------------------------------------ | ------ |
| Navigate to target profile                                         | ✅     |
| Open Followers/Following modal                                     | ✅     |
| Switch to "Following" tab                                          | ✅     |
| Incremental scrolling (300-500px)                                  | ✅     |
| Find one Follow button at a time (avoids stale elements)           | ✅     |
| **Human Protocol** hover + click                                   | ✅     |
| **Verify follow worked** (check button changed to "Following")     | ✅     |
| **Safety Valve** (1 rejected follow = stop session)                | ✅     |
| **Imperfect Timing** (15-60 seconds between follows)               | ✅     |
| **Coffee Breaks** (2-5m every ~5 follows)                          | ✅     |
| Skip already-followed users (DB check per profile)                 | ✅     |
| Log follows to `engagement_log` table                              | ✅     |
| Session continuation (Session 2 picks up where Session 1 left off) | ✅     |

### 4. AI Commenter (White Panel)

**Files:** `threads_comment_worker.py`, `run_comment.py`, `comment_config.py`, `core/ai_generator.py`

| Feature                                            | Status |
| -------------------------------------------------- | ------ |
| Navigate to "For You" feed                         | ✅     |
| Detect posts using Reply buttons                   | ✅     |
| Extract post text (robust `[dir="auto"]` strategy) | ✅     |
| Filter spam/link-farm posts                        | ✅     |
| Skip already-commented posts (DB check)            | ✅     |
| Like post before commenting                        | ✅     |
| Click Reply button                                 | ✅     |
| **Handle BOTH modal and inline reply**             | ✅     |
| **Use active_element for focused input**           | ✅     |
| Generate context-aware AI comment (OpenAI/Groq)    | ✅     |
| Human-like typing simulation                       | ✅     |
| Submit comment (Post button or Enter fallback)     | ✅     |
| **Hard stop when goal reached**                    | ✅     |
| Emoji/special character stripping                  | ✅     |
| Log comments to `engagement_log` table             | ✅     |

### 5. Database

**File:** `database.py`

| Table             | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `sessions`        | Track worker sessions (start/end time, status, stats)      |
| `engagement_log`  | Log every action (follow, like, comment) with username/URL |
| `daily_limits`    | Track daily counts per profile                             |
| `scheduled_tasks` | Store scheduled sessions with target_username              |

---

## Configuration

### `growth_config.py` (Human Protocol)

```python
GROWTH_SETTINGS = {
    "max_follows_per_session": 15,    # Safe limit per session
    "max_rejections": 1,              # STOP if 1 follow is rejected
    "delay_min": 15,                  # Min seconds between follows
    "delay_max": 60,                  # Max seconds between follows
    "enable_breaks": True,            # Enable coffee breaks
    "break_every_min": 4,             # Break every 4-7 follows
    "break_duration_min": 120,        # Break for 2-5 minutes
    "verify_follow": True,            # Check if follow actually worked
    "hover_before_click": True,       # Human-like hover before clicking
}
```

---

## How Session Continuation Works

When you run Growth targeting `@zuck`:

1. **Session 1 (10:00 AM):** Follows 15 users from zuck's Following list
2. **Session 2 (4:00 PM):** Opens same target, but:
   - Users already showing "Following" button are skipped (Threads UI)
   - Users in `engagement_log` with `action_type=follow` are skipped (our DB)
   - Effectively continues from where Session 1 left off
3. **Result:** ~30-45 follows/day split across 2-3 human-like sessions

---

## Troubleshooting

### Profile lookup spam in terminal
**Fixed:** Profiles are cached at startup. If you still see spam, restart the server.

### "Stale element reference" errors
**Fixed:** Worker finds one button at a time and re-queries the DOM each iteration.

### Follows getting rejected
**Normal:** Threads rate limits. The bot detects this (Safety Valve) and pauses. **Wait 1-2 hours before retrying.**

### Sessions not running automatically
**Check:**
1. `GOLOGIN_THREADS_PROFILES` is set in `.env`
2. `THREADS_DEFAULT_TARGET` is set in `.env`
3. Server is running (`python server.py`)

---

## Changelog

### 2024-12-09
- ✅ **AI Commenter Fully Working:**
  - Fixed input finding (uses `active_element` - Threads auto-focuses reply input)
  - Handles BOTH modal and inline reply scenarios
  - Proper goal enforcement (hard stop when limit reached)
  - Posts Reply buttons → get parent post → like + comment
- ✅ **Debugging methodology:**
  - JS debug scripts to analyze Threads DOM
  - Identified inline vs modal reply behavior

### 2024-12-08
- ✅ **Human Protocol Implementation:**
  - Safety Valve (Stop on 1 rejection)
  - Imperfect Timing (15-60s delays)
  - Coffee Breaks (2-5m pause)
  - Verification logic rewritten
- ✅ **Web UI Fixes:**
  - Restored Target Username input
  - Manual Log Refresh button
  - Corrected Session history display
- ✅ **Database Maintenance:**
  - `backfill_sessions.py` to fix historical data
  - `wipe_db.py` for clean slate
- ✅ **Auto-Schedule:** 6-hour follow-up for manual sessions

### 2024-12-07
- ✅ Fixed AI comment context
- ✅ Added emoji stripping
- ✅ Improved post text extraction
- ✅ Human-like behavior (hover, random delays, long breaks)
- ✅ Incremental scrolling (avoids stale elements)

### 2024-12-06
- ✅ Implemented Dark Panel (Targeted Follow)
- ✅ Implemented White Panel (AI Commenter)
- ✅ Database logging and deduplication
- ✅ GoLogin integration

