-- =====================================================
-- GOLOGIN OAUTH MICROSERVICE - DATABASE SCHEMA
-- =====================================================
-- This schema includes ONLY the tables needed for the
-- GoLogin OAuth automation microservice.
-- Compatible with both SQLite and PostgreSQL
-- =====================================================

-- =====================================================
-- 1. USERS TABLE (for microservice admin/auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Use SERIAL in PostgreSQL
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. TWITTER API CONFIGS (OAuth app credentials)
-- =====================================================
CREATE TABLE IF NOT EXISTS twitter_api_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Use SERIAL in PostgreSQL
    name TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    callback_url TEXT,
    proxy_url TEXT
);

-- =====================================================
-- 3. TWITTER ACCOUNTS (account credentials & OAuth tokens)
-- =====================================================
CREATE TABLE IF NOT EXISTS twitter_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Use SERIAL in PostgreSQL
    account_name TEXT NOT NULL,
    
    -- OAuth 1.0a credentials (legacy, not used for OAuth automation)
    consumer_key TEXT NOT NULL,
    consumer_secret TEXT NOT NULL,
    access_token TEXT NOT NULL,
    access_token_secret TEXT NOT NULL,
    
    -- OAuth 2.0 credentials & tokens
    oauth_type TEXT CHECK(oauth_type IN ('oauth1', 'oauth2')) DEFAULT 'oauth1',
    client_id TEXT,
    client_secret TEXT,
    oauth2_access_token TEXT,
    oauth2_refresh_token TEXT,
    oauth2_token_expires_at TIMESTAMP,
    last_token_refresh DATETIME,
    oauth2_scopes TEXT,
    
    -- Account login credentials (stored in custom_prompt field)
    -- Format: CSV_PASSWORD:password|2FA_SECRET:totp_secret
    custom_prompt TEXT,
    
    -- App configuration
    app_type TEXT DEFAULT 'AIOTT1',
    api_config_id INTEGER REFERENCES twitter_api_configs(id),
    
    -- Status & metadata
    is_active INTEGER DEFAULT 0,
    auth_type TEXT DEFAULT 'manual',
    bearer_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Not needed for OAuth microservice (but kept for compatibility)
    style TEXT DEFAULT 'neutral',
    length TEXT DEFAULT 'medium',
    speech_settings TEXT DEFAULT 'text',
    use_emoji INTEGER DEFAULT 0,
    use_hashtags INTEGER DEFAULT 0,
    persona_id INTEGER,
    custom_style TEXT,
    custom_length TEXT,
    custom_speech_settings TEXT,
    custom_use_emoji TEXT,
    custom_use_hashtags TEXT,
    automation_mode TEXT CHECK(automation_mode IN ('manual', 'automatic')) DEFAULT 'manual',
    automation_settings TEXT,
    automation_persona_id INTEGER,
    mention_user BOOLEAN DEFAULT 1,
    rss_settings TEXT
);

-- =====================================================
-- 4. GOLOGIN PROFILES (browser profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS gologin_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Use SERIAL in PostgreSQL
    account_id INTEGER,
    profile_id TEXT NOT NULL UNIQUE,
    profile_name TEXT NOT NULL,
    
    -- Browser configuration
    os_type TEXT DEFAULT 'win',
    proxy_country TEXT,
    proxy_type TEXT,
    user_agent TEXT,
    screen_resolution TEXT,
    timezone TEXT,
    language TEXT,
    
    -- Execution mode
    execution_mode TEXT DEFAULT 'cloud',  -- 'cloud' or 'local'
    assigned_port INTEGER,
    
    -- Status & metadata
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_warmup_at TIMESTAMP,
    last_sync_at TIMESTAMP,
    warmup_count INTEGER DEFAULT 0,
    cloud_profile_data TEXT,  -- JSON data from GoLogin API
    notes TEXT,
    
    -- Captcha tracking
    captcha_detected INTEGER DEFAULT 0,
    captcha_resolved INTEGER DEFAULT 0,
    captcha_detected_at TIMESTAMP,
    captcha_resolved_at TIMESTAMP,
    captcha_detection_reason TEXT,
    
    FOREIGN KEY (account_id) REFERENCES twitter_accounts(id) ON DELETE SET NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gologin_profiles_execution_mode ON gologin_profiles(execution_mode);
CREATE INDEX IF NOT EXISTS idx_gologin_profiles_sync ON gologin_profiles(last_sync_at);

-- =====================================================
-- 5. OAUTH AUTOMATION JOBS (individual OAuth jobs)
-- =====================================================
CREATE TABLE IF NOT EXISTS oauth_automation_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Use SERIAL in PostgreSQL
    
    -- Job identification
    profile_id TEXT NOT NULL,
    api_app TEXT NOT NULL,
    batch_id TEXT,
    
    -- Job status
    status TEXT DEFAULT 'pending',  -- pending, running, completed, failed
    progress_step TEXT,
    error_message TEXT,
    
    -- Associated account
    account_id INTEGER,
    
    -- Retry tracking
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_oauth_jobs_profile ON oauth_automation_jobs(profile_id);
CREATE INDEX IF NOT EXISTS idx_oauth_jobs_status ON oauth_automation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_oauth_jobs_batch ON oauth_automation_jobs(batch_id);

-- =====================================================
-- 6. OAUTH AUTOMATION BATCHES (batch tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS oauth_automation_batches (
    id TEXT PRIMARY KEY,
    name TEXT,
    
    -- Batch stats
    total_jobs INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    failed_jobs INTEGER DEFAULT 0,
    
    -- Configuration
    api_app TEXT NOT NULL,
    status TEXT DEFAULT 'running',  -- running, completed, failed
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_by INTEGER,
    
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =====================================================
-- 7. OAUTH AUTOMATION STATES (OAuth state management)
-- =====================================================
CREATE TABLE IF NOT EXISTS oauth_automation_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Use SERIAL in PostgreSQL
    
    -- OAuth state parameter
    state TEXT NOT NULL UNIQUE,
    
    -- Associated job
    profile_id TEXT NOT NULL,
    api_app TEXT NOT NULL,
    job_id INTEGER,
    
    -- PKCE parameters
    code_verifier TEXT NOT NULL,
    client_id TEXT NOT NULL,
    callback_url TEXT NOT NULL,
    oauth_url TEXT,
    
    -- State tracking
    used BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES oauth_automation_jobs(id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_automation_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_profile ON oauth_automation_states(profile_id);

-- =====================================================
-- 8. DATABASE MAINTENANCE TABLE (for optimization)
-- =====================================================
CREATE TABLE IF NOT EXISTS db_maintenance (
    key TEXT PRIMARY KEY,
    value INTEGER
);

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- =====================================================
-- POSTGRESQL CONVERSION NOTES:
-- =====================================================
-- For PostgreSQL, make these changes:
-- 1. Replace "INTEGER PRIMARY KEY AUTOINCREMENT" with "SERIAL PRIMARY KEY"
-- 2. Replace "INTEGER DEFAULT 0" with "INTEGER DEFAULT 0" (same)
-- 3. Replace "INTEGER DEFAULT 1" with "INTEGER DEFAULT 1" (same)
-- 4. Replace "BOOLEAN" with "BOOLEAN" (same)
-- 5. Replace "TEXT" with "VARCHAR" or "TEXT" (both work in PostgreSQL)
-- 6. Replace "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" with "TIMESTAMP DEFAULT NOW()"
-- 7. Remove "IF NOT EXISTS" from CREATE TABLE (PostgreSQL doesn't support it in all versions)
-- =====================================================
