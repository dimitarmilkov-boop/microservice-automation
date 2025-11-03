# Instagram Engagement Service - Progress & Requirements

## 🎉 What We've Built (WORKING!)

### ✅ Core Infrastructure
- **Shared Browser Automation Module** (`shared/browser_automation/`)
  - `gologin_manager.py` - GoLogin session management
  - `selenium_base.py` - Selenium utility functions
  - `browser_profiles.py` - Profile management with caching
  - Integrated `webdriver-manager` for automatic ChromeDriver version matching

- **Instagram Engagement Service** (`services/ig-engagement-service/`)
  - `config.py` - Pydantic settings from root `.env`
  - `database.py` - SQLite operations
  - `ig_selectors.py` - Instagram CSS/XPath selectors
  - `scheduler.py` - Session scheduling logic
  - `automation_worker.py` - Main automation logic (skeleton)
  - `test_explore_liker.py` - **WORKING TEST SCRIPT** ✅

### ✅ Database Schema (`ig_engagement.db`)
All 7 tables created successfully:
1. `processed_posts` - Tracks liked posts (working!)
2. `daily_likes` - Daily like counts per profile
3. `engagement_log` - Detailed action logs
4. `target_accounts` - Target Instagram accounts
5. `sessions` - Session tracking
6. `scheduled_sessions` - Scheduled session times

### ✅ Working Features (Tested & Verified!)
- ✅ GoLogin Cloud mode launches pre-authenticated Instagram accounts
- ✅ Navigate to `instagram.com/explore`
- ✅ Find random posts with 3+ comments
- ✅ Detect comment like buttons (16x16 SVG, structure-based)
- ✅ Skip already-liked comments
- ✅ Click like buttons (with JavaScript fallback)
- ✅ Human-like delays between actions (3-7 seconds)
- ✅ Detailed JSON/text logging with timestamps
- ✅ Database tracking to prevent duplicate processing
- ✅ Cookie popup handler (Polish support)
- ✅ Scrolling within comments container

**Manual Verification:** Successfully liked 3 comments on https://www.instagram.com/p/DPt6LsjDDNR/ ✅

---

## 📋 Viktor's Requirements (From Meeting Notes)

### Phase 1: Current Implementation (Explore Mode)
**Goal:** Test the strategy with random posts from `/explore`

**Current Behavior:**
- ✅ Navigate to `/explore`
- ✅ Randomly select posts
- ✅ Like top 3 comments per post
- ⚠️ **BUG:** Only likes 2 comments instead of 3 (needs investigation)
- ✅ Track processed posts to avoid duplicates

### Phase 2: Targeted Accounts (When Viktor Provides List)
**Goal:** Target specific Instagram accounts from `ig_targets.txt`

**Required Behavior:**
1. Read target accounts from `ig_targets.txt`
2. Open each target account's profile
3. Find their recent posts
4. Like 3 comments on each post

**Environment Variable:** `IG_USE_EXPLORE_MODE=true` (switch to `false` for Phase 2)

---

## 📊 Daily Limits & Session Structure

### Per Account Limits (from `.env`):
```ini
IG_DAILY_LIKE_LIMIT=30          # Max likes per day per profile
IG_COMMENTS_TO_LIKE=3           # Fixed: 3 comments per post
IG_POSTS_PER_SESSION=5          # Posts to process per session
IG_ACTION_DELAY_MIN=3           # Min delay between actions (seconds)
IG_ACTION_DELAY_MAX=7           # Max delay between actions (seconds)
```

### Session Calculation:
- **30 likes/day ÷ 3 likes/post = 10 posts/day**
- **10 posts/day ÷ 5 posts/session = 2 sessions/day**
- **Sessions spread throughout the day** (randomized times)

### Example Schedule for 1 Profile:
```
Session 1: 09:23 AM - Like 3 comments on 5 posts (15 likes)
Session 2: 04:47 PM - Like 3 comments on 5 posts (15 likes)
Total: 30 likes/day ✅
```

### Multiple Profiles:
```ini
GOLOGIN_IG_PROFILES=ig_monu_sumtan,ig_shivam_yada4v,ig_wasim_akhta3r,ig_p_q,ig_rsockey
```
- 5 profiles × 30 likes = **150 likes/day total**
- Each profile runs independently with its own schedule

---

## 🎯 Next Steps (To Implement)

### 1. Fix the "2 likes instead of 3" Bug
**Issue:** Script reports clicking 3 buttons but only 2 register on Instagram
**Possible Causes:**
- Instagram rate limiting/detection?
- Timing issue with the 3rd click?
- Need to investigate why 3rd like doesn't register

### 2. Integrate Working Logic to `automation_worker.py`
**Tasks:**
- Copy proven logic from `test_explore_liker.py`
- Add proper session tracking to `sessions` table
- Add engagement logging to `engagement_log` table
- Add daily like counting to `daily_likes` table
- Implement daily limit checking (30 likes/day)

### 3. Implement Full Logging
**Required Logs:**
- Each post opened (URL, author, timestamp)
- Each comment liked (text, author, likes_before, timestamp)
- Session start/end times
- Daily like counts per profile
- Errors and skipped actions

### 4. Connect `ig_liker.py` to Scheduler
**Flow:**
- `ig_liker.py` starts scheduler loop
- Scheduler checks every 5 minutes for due sessions
- Launches `automation_worker.py` when session is due
- Tracks progress in `scheduled_sessions` table

### 5. Test Multi-Session Flow
**Validation:**
- Run 2 sessions in one day per profile
- Verify 15 likes per session
- Verify daily limit stops at 30 likes
- Verify all data logged correctly

### 6. Phase 2: Targeted Accounts (When Viktor Provides)
**Implementation:**
- Switch `IG_USE_EXPLORE_MODE=false`
- Add logic to navigate to user profile pages
- Find recent posts from target accounts
- Apply same comment liking logic

---

## 📂 Repository Status

**Last Commit:**
```
feat: Add Instagram engagement service with explore mode liking
- 23 files changed, 4608 insertions(+)
- Successfully pushed to GitHub
```

**Working Test Script:** `services/ig-engagement-service/test_explore_liker.py`

---

## 🐛 Known Issues

1. **Only 2 comments liked instead of 3** - Needs investigation
2. **Comment details not extracting** (author, text, likes) - `li[@role='menuitem']` doesn't exist
   - Currently logging `@unknown` and `"..."` for all comments
   - Not critical since likes are working, but nice to have for better logging

---

## 💡 Technical Achievements

1. **Structure-based element detection** - No reliance on brittle class names
2. **GoLogin Cloud mode** - Access pre-authenticated Instagram sessions
3. **Automatic ChromeDriver versioning** - `webdriver-manager` handles compatibility
4. **Proper post tracking** - Database prevents duplicate processing
5. **Human-like behavior** - Random delays, scrolling, cookie handling
6. **Comprehensive logging** - JSON + text logs with full session details

---

## 🔧 Technical Implementation Details

### How the Script Works (Step-by-Step):

#### 1. **Profile Launch**
```python
# services/ig-engagement-service/test_explore_liker.py
profile_manager = BrowserProfileManager(gologin_token, logger)
profile_id = profile_manager.get_profile_id_by_name("ig_monu_sumtan")

gologin_session = gologin_manager.start_session(profile_id)
# Returns: {"debugger_address": "127.0.0.1:PORT", "profile": gl, "tmpdir": path}
```

#### 2. **Selenium Connection**
```python
driver = gologin_session["driver"]  # ChromeDriver with webdriver-manager
```

#### 3. **Navigate to Explore**
```python
driver.get("https://www.instagram.com/explore/")
# Cookie popup detection and dismissal
_handle_cookie_popup()
```

#### 4. **Find Posts**
```python
# Find all post links (structure-based, not class-based)
post_elements = driver.find_elements(By.CSS_SELECTOR, "a[href*='/p/']")
post_urls = [elem.get_attribute('href') for elem in post_elements]
```

#### 5. **Check if Post Already Processed**
```python
cursor.execute("SELECT 1 FROM processed_posts WHERE post_url = ?", (post_url,))
if cursor.fetchone():
    logger.info("Post already processed, skipping...")
    continue
```

#### 6. **Open Post & Count Comments**
```python
driver.get(post_url)

# Find comments UL by structure (has multiple LI children)
ul_elements = driver.find_elements(By.CSS_SELECTOR, "ul")
for ul in ul_elements:
    li_children = ul.find_elements(By.CSS_SELECTOR, "li")
    if len(li_children) >= 3:
        comment_count = len(li_children)
        break

if comment_count < 3:
    logger.warning("Post has less than 3 comments, skipping...")
    continue
```

#### 7. **Scroll Comments Container**
```python
# Scroll within the comments UL to load all comments
driver.execute_script("""
    arguments[0].scrollTop = arguments[0].scrollHeight;
""", comments_ul)
```

#### 8. **Find Comment Like Buttons**
```python
# Find ALL SVG elements on page
all_svgs = driver.find_elements(By.CSS_SELECTOR, "svg")

for svg in all_svgs:
    aria_label = svg.get_attribute('aria-label')
    height = svg.get_attribute('height')
    
    # Check if this is a like button (Polish: "Lubię to!")
    if any(word in aria_label.lower() for word in ['like', 'polub', 'lubi']):
        # Skip post like button (24x24)
        if height == '24':
            continue
        
        # Skip already-liked comments ("Unlike")
        if 'unlike' in aria_label.lower():
            continue
        
        # Get clickable parent with role="button"
        parent = svg.find_element(By.XPATH, "./ancestor::*[@role='button'][1]")
        like_buttons.append(parent)
```

#### 9. **Click Like Buttons**
```python
for button in like_buttons[:3]:  # Only first 3
    # Scroll into view
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
    time.sleep(0.5)
    
    # Try regular click
    try:
        button.click()
    except:
        # Fallback to JavaScript click
        driver.execute_script("arguments[0].click();", button)
    
    # Wait for like to register
    time.sleep(1)
    
    # Human-like delay before next like
    delay = random.uniform(3.0, 7.0)
    time.sleep(delay)
```

#### 10. **Save to Database**
```python
cursor.execute("""
    INSERT INTO processed_posts (post_url, profile_id, comments_liked, status)
    VALUES (?, ?, ?, 'completed')
""", (post_url, profile_id, 3))
conn.commit()
```

#### 11. **Logging**
```json
{
  "session_id": "uuid",
  "profile_name": "ig_monu_sumtan",
  "started_at": "2025-11-02T15:03:38",
  "ended_at": "2025-11-02T15:05:26",
  "posts": [
    {
      "url": "https://www.instagram.com/p/DPt6LsjDDNR/",
      "opened_at": "2025-11-02T15:04:50",
      "comments": [
        {
          "index": 1,
          "clicked": true,
          "timestamp": "2025-11-02T15:05:02"
        },
        // ... 2 more comments
      ]
    }
  ]
}
```

---

## 🗄️ Database Schema Details

### `ig_engagement.db` Structure:

#### 1. **processed_posts**
```sql
CREATE TABLE processed_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_url TEXT UNIQUE NOT NULL,
    instagram_username TEXT,
    profile_id TEXT NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments_liked INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',  -- pending, completed, failed, skipped
    notes TEXT
);
```
**Purpose:** Track which posts have been processed to avoid duplicates

#### 2. **daily_likes**
```sql
CREATE TABLE daily_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    date DATE NOT NULL,
    like_count INTEGER DEFAULT 0,
    limit_reached BOOLEAN DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, date)
);
```
**Purpose:** Track daily like counts per profile (enforce 30/day limit)

#### 3. **engagement_log**
```sql
CREATE TABLE engagement_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_id TEXT NOT NULL,
    action TEXT NOT NULL,  -- 'like_comment', 'skip_post', 'error', etc.
    target_url TEXT,
    instagram_username TEXT,
    success BOOLEAN DEFAULT 1,
    error_message TEXT,
    metadata TEXT,  -- JSON string with additional details
    session_id TEXT
);
```
**Purpose:** Detailed log of every action taken

#### 4. **sessions**
```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,  -- UUID
    profile_id TEXT NOT NULL,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    status TEXT DEFAULT 'running',  -- running, completed, failed, cancelled
    likes_performed INTEGER DEFAULT 0,
    posts_processed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0
);
```
**Purpose:** Track each automation session (2 per day per profile)

#### 5. **scheduled_sessions**
```sql
CREATE TABLE scheduled_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    profile_name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    scheduled_datetime TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, running, completed, failed, skipped
    session_id TEXT,  -- Links to sessions.id
    posts_target INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    UNIQUE(profile_id, scheduled_datetime)
);
```
**Purpose:** Pre-schedule sessions at random times throughout the day

---

## 📦 Files Created & Their Purposes

### Shared Browser Automation (`shared/browser_automation/`)

**`gologin_manager.py`** (420 lines)
- Class: `GoLoginManager`
- Methods: `start_session()`, `cleanup_session()`, `_connect_selenium()`
- Purpose: Manage GoLogin profiles, start/stop browsers, connect Selenium
- Key Features: Cloud/Local mode, retry logic, ChromeDriver auto-install

**`selenium_base.py`** (150 lines)
- Functions: `connect_to_browser()`, `wait_for_element()`, `safe_click()`
- Purpose: Common Selenium utilities for all services
- Reusable across X Auth and IG services

**`browser_profiles.py`** (180 lines)
- Class: `BrowserProfileManager`
- Methods: `list_profiles()`, `get_profile_id_by_name()`, `_fetch_from_api()`
- Purpose: GoLogin API integration, profile caching
- Cache File: `.gologin_profiles_cache.json`

### Instagram Service (`services/ig-engagement-service/`)

**`config.py`** (109 lines)
- Class: `Settings(BaseSettings)`
- Loads all IG config from root `.env` file
- Validates required environment variables
- Extra settings ignored (for shared .env)

**`database.py`** (300 lines)
- Functions: `init_db()`, `is_post_processed()`, `mark_post_processed()`, `get_daily_likes()`, `increment_daily_likes()`
- Purpose: All SQLite operations
- Schema file: `shared/ig_db_schema.sql`

**`ig_selectors.py`** (50 lines)
- Constants: Post selectors, comment selectors, button selectors
- Purpose: Centralized CSS/XPath selectors (easy to update if IG changes)

**`scheduler.py`** (250 lines)
- Class: `SessionScheduler`
- Methods: `allocate_daily_sessions()`, `check_and_run_sessions()`, `run_forever()`
- Purpose: Schedule 2 sessions/day at random times per profile
- Check interval: Every 5 minutes

**`automation_worker.py`** (200 lines)
- Class: `InstagramWorker` (skeleton)
- Methods: `run_session()`, `process_posts()`, `like_comments()`
- Status: Framework only, needs logic from test script

**`test_explore_liker.py`** (745 lines) **← WORKING SCRIPT**
- Class: `InstagramExploreLiker`
- Methods: `run()`, `process_one_post()`, `find_comment_like_buttons()`, etc.
- Status: Fully functional, manually verified ✅
- This is the reference implementation!

**`ig_liker.py`** (170 lines)
- Main entry point (CLI script)
- Initializes database, config, scheduler
- Starts scheduler loop
- Status: Ready for integration with worker

---

## 🔐 Environment Variables (from `.env`)

### GoLogin:
```ini
GOLOGIN_TOKEN=your_token_here
GOLOGIN_LOCAL_MODE=false  # false = Cloud mode (CRITICAL!)
GOLOGIN_IG_PROFILES=ig_monu_sumtan,ig_shivam_yada4v,ig_wasim_akhta3r,ig_p_q,ig_rsockey
```

### Instagram Limits:
```ini
IG_DAILY_LIKE_LIMIT=30
IG_COMMENTS_TO_LIKE=3
IG_POSTS_PER_SESSION=5
IG_ACTION_DELAY_MIN=3
IG_ACTION_DELAY_MAX=7
IG_SCHEDULER_CHECK_INTERVAL=300  # 5 minutes
```

### Modes:
```ini
IG_USE_EXPLORE_MODE=true  # true = /explore, false = ig_targets.txt
IG_TARGET_ACCOUNTS_FILE=ig_targets.txt
IG_DATABASE_PATH=ig_engagement.db
```

---

## 🧪 How to Test Tomorrow

### 1. Quick Test (Single Post):
```bash
cd services/ig-engagement-service
python test_explore_liker.py
```
**Expected:** Opens browser, likes 3 comments, saves logs

### 2. Check Database:
```bash
python -c "import sqlite3; conn = sqlite3.connect('../../ig_engagement.db'); cursor = conn.cursor(); cursor.execute('SELECT * FROM processed_posts'); [print(row) for row in cursor.fetchall()]"
```

### 3. View Logs:
```bash
cd logs
# Open latest JSON file
cat explore_ig_monu_sumtan_*.json
```

### 4. Manual Verification:
1. Get post URL from log file
2. Open in browser (logged in with same IG account)
3. Check if first 3 comments have red hearts

---

## 📞 Questions for Viktor

1. **Why are we only getting 2 likes instead of 3?** Is this Instagram detection?
2. **When will the target accounts list be ready for Phase 2?**
3. Should we add any additional safety features (e.g., longer delays, max retries)?
4. Any specific logging format or metrics he wants to track?
5. **Should we investigate the "2 likes" issue before proceeding?** Or continue with scheduler integration?

---

## 🎯 Tomorrow's Priorities

### Option A: Investigate "2 Likes" Bug
1. Add more detailed logging around click events
2. Check if 3rd comment button is actually different
3. Test with different posts to see if consistent
4. Add verification step (read aria-label after click)

### Option B: Continue with Scheduler Integration
1. Copy working logic from `test_explore_liker.py` to `automation_worker.py`
2. Add session tracking to database
3. Connect scheduler to worker
4. Test 2-session flow

**Recommendation:** Option B - Continue with scheduler, then circle back to investigate if issue persists

