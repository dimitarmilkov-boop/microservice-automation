-- =====================================================
-- INSTAGRAM ENGAGEMENT SERVICE - DATABASE SCHEMA
-- =====================================================
-- SQLite database for tracking Instagram engagement activities
-- Database file: ig_engagement.db (in project root)
-- =====================================================

-- =====================================================
-- 1. PROCESSED POSTS TABLE
-- =====================================================
-- Tracks all posts that have been processed to avoid duplicates
CREATE TABLE IF NOT EXISTS processed_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_url TEXT NOT NULL UNIQUE,
    instagram_username TEXT NOT NULL,
    profile_id TEXT NOT NULL,  -- GoLogin profile ID used
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments_liked INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed',  -- completed, failed, skipped
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_processed_posts_url ON processed_posts(post_url);
CREATE INDEX IF NOT EXISTS idx_processed_posts_username ON processed_posts(instagram_username);
CREATE INDEX IF NOT EXISTS idx_processed_posts_date ON processed_posts(processed_at);

-- =====================================================
-- 2. DAILY LIKES TABLE
-- =====================================================
-- Tracks daily like counts per profile for limit enforcement
CREATE TABLE IF NOT EXISTS daily_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    date DATE NOT NULL,
    like_count INTEGER DEFAULT 0,
    limit_reached BOOLEAN DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(profile_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_likes_profile_date ON daily_likes(profile_id, date);

-- =====================================================
-- 3. ENGAGEMENT LOG TABLE
-- =====================================================
-- Comprehensive activity log for all actions
CREATE TABLE IF NOT EXISTS engagement_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_id TEXT NOT NULL,
    action TEXT NOT NULL,  -- navigate, like_comment, skip_post, error, etc.
    target_url TEXT,
    instagram_username TEXT,
    success BOOLEAN DEFAULT 1,
    error_message TEXT,
    metadata TEXT,  -- JSON string for additional data
    session_id TEXT  -- Group activities by session
);

CREATE INDEX IF NOT EXISTS idx_engagement_log_timestamp ON engagement_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_engagement_log_profile ON engagement_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_engagement_log_action ON engagement_log(action);
CREATE INDEX IF NOT EXISTS idx_engagement_log_session ON engagement_log(session_id);

-- =====================================================
-- 4. TARGET ACCOUNTS TABLE
-- =====================================================
-- Tracks target Instagram accounts and their processing history
CREATE TABLE IF NOT EXISTS target_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_processed_at TIMESTAMP,
    posts_processed INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_target_accounts_username ON target_accounts(username);
CREATE INDEX IF NOT EXISTS idx_target_accounts_active ON target_accounts(is_active);

-- =====================================================
-- 5. SESSIONS TABLE
-- =====================================================
-- Tracks automation sessions (start/stop times)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,  -- UUID
    profile_id TEXT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    status TEXT DEFAULT 'running',  -- running, completed, stopped, error
    likes_performed INTEGER DEFAULT 0,
    accounts_processed INTEGER DEFAULT 0,
    posts_processed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sessions_profile ON sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);

-- =====================================================
-- 6. SCHEDULED SESSIONS TABLE
-- =====================================================
-- Tracks planned session times for each profile (randomized daily)
CREATE TABLE IF NOT EXISTS scheduled_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    profile_name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    scheduled_datetime TIMESTAMP NOT NULL,  -- Combined date + time for easy comparison
    status TEXT DEFAULT 'pending',  -- pending, running, completed, failed, skipped
    session_id TEXT,  -- Links to sessions.id when executed
    posts_target INTEGER DEFAULT 5,  -- Number of posts to process in this session
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    
    UNIQUE(profile_id, scheduled_datetime)
);

CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_profile ON scheduled_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_datetime ON scheduled_sessions(scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_status ON scheduled_sessions(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_date ON scheduled_sessions(scheduled_date);

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- Daily summary view
CREATE VIEW IF NOT EXISTS daily_summary AS
SELECT 
    date,
    profile_id,
    like_count,
    limit_reached,
    (SELECT COUNT(*) FROM engagement_log el 
     WHERE DATE(el.timestamp) = dl.date 
     AND el.profile_id = dl.profile_id 
     AND el.action = 'like_comment') as actual_likes,
    last_updated
FROM daily_likes dl
ORDER BY date DESC, profile_id;

-- Recent activity view
CREATE VIEW IF NOT EXISTS recent_activity AS
SELECT 
    timestamp,
    profile_id,
    action,
    target_url,
    instagram_username,
    success,
    error_message
FROM engagement_log
ORDER BY timestamp DESC
LIMIT 100;

-- Profile statistics view
CREATE VIEW IF NOT EXISTS profile_stats AS
SELECT 
    profile_id,
    COUNT(DISTINCT DATE(processed_at)) as days_active,
    COUNT(*) as total_posts_processed,
    SUM(comments_liked) as total_comments_liked,
    MIN(processed_at) as first_activity,
    MAX(processed_at) as last_activity
FROM processed_posts
GROUP BY profile_id;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

