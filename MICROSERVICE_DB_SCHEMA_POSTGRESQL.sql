-- =====================================================
-- GOLOGIN OAUTH MICROSERVICE - POSTGRESQL SCHEMA
-- =====================================================
-- This schema is specifically for PostgreSQL
-- For SQLite version, see MICROSERVICE_DB_SCHEMA.sql
-- =====================================================

-- =====================================================
-- 1. USERS TABLE (for microservice admin/auth)
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. TWITTER API CONFIGS (OAuth app credentials)
-- =====================================================
CREATE TABLE twitter_api_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    callback_url TEXT,
    proxy_url TEXT
);

-- =====================================================
-- 3. TWITTER ACCOUNTS (account credentials & OAuth tokens)
-- =====================================================
CREATE TABLE twitter_accounts (
    id SERIAL PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    
    -- OAuth 1.0a credentials (legacy, not used for OAuth automation)
    consumer_key TEXT NOT NULL DEFAULT '',
    consumer_secret TEXT NOT NULL DEFAULT '',
    access_token TEXT NOT NULL DEFAULT '',
    access_token_secret TEXT NOT NULL DEFAULT '',
    
    -- OAuth 2.0 credentials & tokens
    oauth_type VARCHAR(10) CHECK(oauth_type IN ('oauth1', 'oauth2')) DEFAULT 'oauth1',
    client_id TEXT,
    client_secret TEXT,
    oauth2_access_token TEXT,
    oauth2_refresh_token TEXT,
    oauth2_token_expires_at TIMESTAMP,
    last_token_refresh TIMESTAMP,
    oauth2_scopes TEXT,
    
    -- Account login credentials (stored in custom_prompt field)
    -- Format: CSV_PASSWORD:password|2FA_SECRET:totp_secret
    custom_prompt TEXT,
    
    -- App configuration
    app_type VARCHAR(50) DEFAULT 'AIOTT1',
    api_config_id INTEGER REFERENCES twitter_api_configs(id),
    
    -- Status & metadata
    is_active BOOLEAN DEFAULT FALSE,
    auth_type VARCHAR(50) DEFAULT 'manual',
    bearer_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Not needed for OAuth microservice (but kept for compatibility)
    style VARCHAR(50) DEFAULT 'neutral',
    length VARCHAR(50) DEFAULT 'medium',
    speech_settings VARCHAR(50) DEFAULT 'text',
    use_emoji BOOLEAN DEFAULT FALSE,
    use_hashtags BOOLEAN DEFAULT FALSE,
    persona_id INTEGER,
    custom_style TEXT,
    custom_length TEXT,
    custom_speech_settings TEXT,
    custom_use_emoji TEXT,
    custom_use_hashtags TEXT,
    automation_mode VARCHAR(20) CHECK(automation_mode IN ('manual', 'automatic')) DEFAULT 'manual',
    automation_settings TEXT,
    automation_persona_id INTEGER,
    mention_user BOOLEAN DEFAULT TRUE,
    rss_settings TEXT
);

-- =====================================================
-- 4. GOLOGIN PROFILES (browser profiles)
-- =====================================================
CREATE TABLE gologin_profiles (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES twitter_accounts(id) ON DELETE SET NULL,
    profile_id VARCHAR(255) NOT NULL UNIQUE,
    profile_name VARCHAR(255) NOT NULL,
    
    -- Browser configuration
    os_type VARCHAR(50) DEFAULT 'win',
    proxy_country VARCHAR(10),
    proxy_type VARCHAR(50),
    user_agent TEXT,
    screen_resolution VARCHAR(50),
    timezone VARCHAR(100),
    language VARCHAR(10),
    
    -- Execution mode
    execution_mode VARCHAR(50) DEFAULT 'cloud',  -- 'cloud' or 'local'
    assigned_port INTEGER,
    
    -- Status & metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_warmup_at TIMESTAMP,
    last_sync_at TIMESTAMP,
    warmup_count INTEGER DEFAULT 0,
    cloud_profile_data JSONB,  -- Use JSONB for better performance in PostgreSQL
    notes TEXT,
    
    -- Captcha tracking
    captcha_detected BOOLEAN DEFAULT FALSE,
    captcha_resolved BOOLEAN DEFAULT FALSE,
    captcha_detected_at TIMESTAMP,
    captcha_resolved_at TIMESTAMP,
    captcha_detection_reason TEXT
);

-- Indexes for faster lookups
CREATE INDEX idx_gologin_profiles_execution_mode ON gologin_profiles(execution_mode);
CREATE INDEX idx_gologin_profiles_sync ON gologin_profiles(last_sync_at);
CREATE INDEX idx_gologin_profiles_account ON gologin_profiles(account_id);

-- =====================================================
-- 5. OAUTH AUTOMATION JOBS (individual OAuth jobs)
-- =====================================================
CREATE TABLE oauth_automation_jobs (
    id SERIAL PRIMARY KEY,
    
    -- Job identification
    profile_id VARCHAR(255) NOT NULL,
    api_app VARCHAR(50) NOT NULL,
    batch_id VARCHAR(255),
    
    -- Job status
    status VARCHAR(50) DEFAULT 'pending',  -- pending, running, completed, failed
    progress_step VARCHAR(255),
    error_message TEXT,
    
    -- Associated account
    account_id INTEGER,
    
    -- Retry tracking
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_oauth_jobs_profile ON oauth_automation_jobs(profile_id);
CREATE INDEX idx_oauth_jobs_status ON oauth_automation_jobs(status);
CREATE INDEX idx_oauth_jobs_batch ON oauth_automation_jobs(batch_id);
CREATE INDEX idx_oauth_jobs_created ON oauth_automation_jobs(created_at DESC);

-- =====================================================
-- 6. OAUTH AUTOMATION BATCHES (batch tracking)
-- =====================================================
CREATE TABLE oauth_automation_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    
    -- Batch stats
    total_jobs INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    failed_jobs INTEGER DEFAULT 0,
    
    -- Configuration
    api_app VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'running',  -- running, completed, failed
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_oauth_batches_status ON oauth_automation_batches(status);
CREATE INDEX idx_oauth_batches_created ON oauth_automation_batches(created_at DESC);

-- =====================================================
-- 7. OAUTH AUTOMATION STATES (OAuth state management)
-- =====================================================
CREATE TABLE oauth_automation_states (
    id SERIAL PRIMARY KEY,
    
    -- OAuth state parameter
    state VARCHAR(255) NOT NULL UNIQUE,
    
    -- Associated job
    profile_id VARCHAR(255) NOT NULL,
    api_app VARCHAR(50) NOT NULL,
    job_id INTEGER REFERENCES oauth_automation_jobs(id),
    
    -- PKCE parameters
    code_verifier VARCHAR(255) NOT NULL,
    client_id TEXT NOT NULL,
    callback_url TEXT NOT NULL,
    oauth_url TEXT,
    
    -- State tracking
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX idx_oauth_states_state ON oauth_automation_states(state);
CREATE INDEX idx_oauth_states_profile ON oauth_automation_states(profile_id);
CREATE INDEX idx_oauth_states_used ON oauth_automation_states(used);
CREATE INDEX idx_oauth_states_expires ON oauth_automation_states(expires_at);

-- =====================================================
-- 8. DATABASE MAINTENANCE TABLE (for optimization)
-- =====================================================
CREATE TABLE db_maintenance (
    key VARCHAR(255) PRIMARY KEY,
    value BIGINT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 9. CLEANUP FUNCTION (PostgreSQL stored procedure)
-- =====================================================
-- Function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM oauth_automation_states 
    WHERE expires_at < NOW() 
    AND used = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. AUTOMATIC CLEANUP TRIGGER (optional)
-- =====================================================
-- Create an extension for cron jobs if available
-- Requires pg_cron extension
-- Run cleanup daily at 3 AM:
-- SELECT cron.schedule('cleanup-oauth-states', '0 3 * * *', 'SELECT cleanup_expired_oauth_states()');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
