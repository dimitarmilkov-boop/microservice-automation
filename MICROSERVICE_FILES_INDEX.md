# GoLogin OAuth Microservice - Complete File Index

## 📋 Summary

This document lists ALL files needed to recreate the exact database schema for the GoLogin OAuth microservice.

---

## 🗄️ Database Schema Files

### **1. SQLite Schema (Development/Testing)**

**File:** `MICROSERVICE_DB_SCHEMA.sql`

**Contents:**

- All 8 core tables with exact field definitions
- Indexes for performance
- SQLite-specific syntax
- PostgreSQL conversion notes in comments

**Usage:**

```bash
sqlite3 gologin_oauth.db < MICROSERVICE_DB_SCHEMA.sql
```

---

### **2. PostgreSQL Schema (Production)**

**File:** `MICROSERVICE_DB_SCHEMA_POSTGRESQL.sql`

**Contents:**

- PostgreSQL-specific data types (SERIAL, JSONB, etc.)
- All indexes and foreign keys
- Stored procedures for cleanup
- Trigger examples

**Usage:**

```bash
psql gologin_oauth < MICROSERVICE_DB_SCHEMA_POSTGRESQL.sql
```

---

## 🔌 Connection Helper Files

### **3. Database Connection Pooling**

**File:** `fix_db_connections.py` (from AIOTT V2)

**Classes:**

- `ConnectionPool`: SQLite connection pooling
- `DBConnection`: Context manager with retry logic
- `DatabaseOptimizer`: VACUUM and ANALYZE automation

**Key Features:**

- Automatic retry on "database is locked"
- WAL mode for better concurrency
- Connection reuse (up to 20 connections)
- Exponential backoff with jitter

**Usage:**

```python
from fix_db_connections import DBConnection

with DBConnection(db_path='gologin_oauth.db') as (conn, cursor):
    cursor.execute("SELECT * FROM twitter_accounts")
```

---

### **4. Connection Usage Examples**

**File:** `MICROSERVICE_DB_CONNECTION_EXAMPLE.py`

**Examples:**

- Basic SQLite usage
- Connection pooling
- Error handling
- PostgreSQL adapter
- Common queries (get disconnected users, mark as connected)

**Usage:**

```bash
python MICROSERVICE_DB_CONNECTION_EXAMPLE.py
```

---

## 📚 Documentation Files

### **5. Complete Database Documentation**

**File:** `MICROSERVICE_DB_README.md`

**Contents:**

- Database schema diagram
- Setup instructions (SQLite & PostgreSQL)
- Credential storage format
- Key queries for microservice
- Performance optimizations
- Setup checklist

---

### **6. File Index (This File)**

**File:** `MICROSERVICE_FILES_INDEX.md`

**Contents:**

- Complete list of all provided files
- Purpose and usage of each file
- Quick reference guide

---

## 📊 Table Definitions Reference

### **Core Tables (8 total)**

| Table                      | Primary Key   | Key Foreign Keys                       | Purpose                            |
| -------------------------- | ------------- | -------------------------------------- | ---------------------------------- |
| `twitter_accounts`         | id (SERIAL)   | api_config_id → twitter_api_configs.id | Account credentials & OAuth tokens |
| `gologin_profiles`         | id (SERIAL)   | account_id → twitter_accounts.id       | Browser profile configuration      |
| `oauth_automation_jobs`    | id (SERIAL)   | None                                   | Individual OAuth job tracking      |
| `oauth_automation_states`  | id (SERIAL)   | job_id → oauth_automation_jobs.id      | OAuth state & PKCE management      |
| `oauth_automation_batches` | id (VARCHAR)  | created_by → users.id                  | Batch operation tracking           |
| `twitter_api_configs`      | id (SERIAL)   | None                                   | OAuth app credentials              |
| `users`                    | id (SERIAL)   | None                                   | Microservice admin auth            |
| `db_maintenance`           | key (VARCHAR) | None                                   | Database optimization tracking     |

---

## 🔑 Critical Fields Reference

### **twitter_accounts Table**

```sql
-- Account credentials (plain text in custom_prompt)
custom_prompt TEXT  -- Format: CSV_PASSWORD:pass|2FA_SECRET:secret

-- OAuth 2.0 tokens
oauth2_access_token TEXT
oauth2_refresh_token TEXT
oauth2_token_expires_at TIMESTAMP
oauth2_scopes TEXT

-- OAuth configuration
oauth_type TEXT  -- 'oauth1' or 'oauth2'
client_id TEXT
client_secret TEXT
app_type TEXT  -- 'AIOTT1', 'AIOTT2', etc.
```

### **gologin_profiles Table**

```sql
profile_id TEXT UNIQUE  -- GoLogin profile UUID
execution_mode TEXT  -- 'cloud' or 'local'
proxy_country TEXT
proxy_type TEXT
captcha_detected BOOLEAN
captcha_resolved BOOLEAN
```

### **oauth_automation_jobs Table**

```sql
profile_id TEXT  -- GoLogin profile to use
status TEXT  -- 'pending', 'running', 'completed', 'failed'
progress_step TEXT  -- Current step (e.g., 'login_form', '2fa_required')
error_message TEXT
retry_count INTEGER
```

### **oauth_automation_states Table**

```sql
state TEXT UNIQUE  -- OAuth state parameter
code_verifier TEXT  -- PKCE code verifier
used BOOLEAN  -- Whether state has been consumed
expires_at TIMESTAMP
```

---

## 🔧 Migration Files (from AIOTT V2)

### **7. OAuth 2.0 Field Migration**

**File:** `migrations/add_oauth2_fields.sql`

**Contents:**

```sql
ALTER TABLE twitter_accounts ADD COLUMN oauth_type TEXT;
ALTER TABLE twitter_accounts ADD COLUMN client_id TEXT;
ALTER TABLE twitter_accounts ADD COLUMN client_secret TEXT;
ALTER TABLE twitter_accounts ADD COLUMN oauth2_access_token TEXT;
ALTER TABLE twitter_accounts ADD COLUMN oauth2_refresh_token TEXT;
ALTER TABLE twitter_accounts ADD COLUMN oauth2_token_expires_at TIMESTAMP;
```

---

### **8. Full Production Migration**

**File:** `migrations/production_sync_migration.sql`

**Contents:**

- All table definitions
- Index creation
- Trigger creation
- Data migration logic
- Idempotent (safe to run multiple times)

---

## 📦 Complete File Checklist

✅ **Schema Files:**

- [ ] `MICROSERVICE_DB_SCHEMA.sql` - SQLite schema
- [ ] `MICROSERVICE_DB_SCHEMA_POSTGRESQL.sql` - PostgreSQL schema

✅ **Connection Files:**

- [ ] `fix_db_connections.py` - Connection pooling (from AIOTT V2)
- [ ] `MICROSERVICE_DB_CONNECTION_EXAMPLE.py` - Usage examples

✅ **Documentation:**

- [ ] `MICROSERVICE_DB_README.md` - Complete documentation
- [ ] `MICROSERVICE_FILES_INDEX.md` - This file

✅ **Migration Files:**

- [ ] `migrations/add_oauth2_fields.sql` - OAuth 2.0 fields
- [ ] `migrations/production_sync_migration.sql` - Full migration

---

## 🚀 Quick Start Guide

### **For SQLite (Development)**

```bash
# 1. Create database
sqlite3 gologin_oauth.db < MICROSERVICE_DB_SCHEMA.sql

# 2. Copy connection helper
cp fix_db_connections.py your_microservice/

# 3. Test connection
python MICROSERVICE_DB_CONNECTION_EXAMPLE.py
```

### **For PostgreSQL (Production)**

```bash
# 1. Create database
createdb gologin_oauth
psql gologin_oauth < MICROSERVICE_DB_SCHEMA_POSTGRESQL.sql

# 2. Configure environment
export POSTGRES_HOST=localhost
export POSTGRES_DB=gologin_oauth
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=yourpassword
export DB_TYPE=postgres

# 3. Copy connection helper (with PostgreSQL adapter)
cp fix_db_connections.py your_microservice/
cp MICROSERVICE_DB_CONNECTION_EXAMPLE.py your_microservice/

# 4. Test connection
python MICROSERVICE_DB_CONNECTION_EXAMPLE.py
```

---

## 📊 Current AIOTT V2 Database Info

**Database:** SQLite (`twitter_accounts.db`)
**Size:** 57MB
**Mode:** WAL (Write-Ahead Logging)
**Connection Pooling:** Yes (max 20 connections)
**Tables:** 15+ total (8 core OAuth tables + others)

**Core OAuth Tables:**

```
twitter_accounts         - 15+ columns, OAuth tokens
gologin_profiles         - Browser profiles
oauth_automation_jobs    - Job tracking
oauth_automation_states  - OAuth state management
oauth_automation_batches - Batch tracking
twitter_api_configs      - OAuth app credentials
users                    - Admin authentication
db_maintenance           - Optimization tracking
```

---

## 🔗 Related AIOTT V2 Files

These files use the same database structure:

| File                                | Purpose                  |
| ----------------------------------- | ------------------------ |
| `selenium_oauth_automation.py`      | Main automation logic    |
| `app.py`                            | Flask REST API for OAuth |
| `fix_db_connections.py`             | Connection pooling       |
| `browser_startup_handler.py`        | Browser automation       |
| `cloudflare_handler.py`             | Captcha handling         |
| `global_gologin_session_manager.py` | Session management       |

---

## ✅ Verification Commands

### **SQLite**

```bash
# Check schema
sqlite3 gologin_oauth.db ".schema"

# List all tables
sqlite3 gologin_oauth.db ".tables"

# Check specific table
sqlite3 gologin_oauth.db ".schema twitter_accounts"

# Check indexes
sqlite3 gologin_oauth.db "SELECT name FROM sqlite_master WHERE type='index';"
```

### **PostgreSQL**

```bash
# List all tables
psql gologin_oauth -c "\dt"

# Check specific table
psql gologin_oauth -c "\d twitter_accounts"

# Check indexes
psql gologin_oauth -c "\di"

# Check foreign keys
psql gologin_oauth -c "SELECT conname FROM pg_constraint WHERE contype = 'f';"
```

---

## 📧 Need Help?

All files are based on the current AIOTT V2 database structure. If you need clarification:

1. Check `MICROSERVICE_DB_README.md` for detailed documentation
2. Review `MICROSERVICE_DB_CONNECTION_EXAMPLE.py` for usage examples
3. Compare with AIOTT V2 files: `selenium_oauth_automation.py`, `app.py`

---

**Last Updated:** September 30, 2025  
**Database Version:** AIOTT V2 (57MB SQLite)  
**Total Files Provided:** 8 files (3 schema, 2 connection, 3 documentation)
