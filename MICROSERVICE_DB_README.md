# GoLogin OAuth Microservice - Database Documentation

## 📚 Overview

This document provides complete database schema and connection information for recreating the GoLogin OAuth automation microservice database.

---

## 📁 Files Provided

### 1. **Schema Files**

| File                                    | Purpose                                                 | Database   |
| --------------------------------------- | ------------------------------------------------------- | ---------- |
| `MICROSERVICE_DB_SCHEMA.sql`            | Complete SQLite schema with PostgreSQL conversion notes | SQLite     |
| `MICROSERVICE_DB_SCHEMA_POSTGRESQL.sql` | PostgreSQL-specific schema with indexes and functions   | PostgreSQL |
| `fix_db_connections.py`                 | Connection pooling and retry logic (from AIOTT V2)      | Both       |
| `MICROSERVICE_DB_CONNECTION_EXAMPLE.py` | Usage examples for both SQLite and PostgreSQL           | Both       |

### 2. **Migration Files** (from AIOTT V2)

| File                                       | Purpose                                         |
| ------------------------------------------ | ----------------------------------------------- |
| `migrations/add_oauth2_fields.sql`         | Adds OAuth 2.0 fields to twitter_accounts       |
| `migrations/production_sync_migration.sql` | Full production migration (includes all tables) |

---

## 🗄️ Database Tables

### **Core OAuth Tables** (Required for microservice)

#### 1. `twitter_accounts`

- **Purpose**: Store X account credentials and OAuth tokens
- **Key Fields**:
  - `custom_prompt`: Account password and 2FA secret (`CSV_PASSWORD:pass|2FA_SECRET:secret`)
  - `oauth2_access_token`: OAuth 2.0 access token
  - `oauth2_refresh_token`: OAuth 2.0 refresh token
  - `oauth2_token_expires_at`: Token expiration timestamp
  - `oauth2_scopes`: Granted scopes (comma-separated)

#### 2. `gologin_profiles`

- **Purpose**: GoLogin browser profile configuration
- **Key Fields**:
  - `profile_id`: GoLogin profile UUID
  - `execution_mode`: 'cloud' or 'local'
  - `proxy_country`, `proxy_type`: Proxy configuration
  - `captcha_detected`, `captcha_resolved`: Captcha tracking

#### 3. `oauth_automation_jobs`

- **Purpose**: Track individual OAuth automation jobs
- **Key Fields**:
  - `profile_id`: Associated GoLogin profile
  - `status`: 'pending', 'running', 'completed', 'failed'
  - `progress_step`: Current automation step
  - `error_message`: Failure reason

#### 4. `oauth_automation_states`

- **Purpose**: Manage OAuth state parameters and PKCE
- **Key Fields**:
  - `state`: OAuth state parameter (unique)
  - `code_verifier`: PKCE code verifier
  - `used`: Whether state has been consumed

#### 5. `oauth_automation_batches`

- **Purpose**: Track batch OAuth operations
- **Key Fields**:
  - `total_jobs`, `completed_jobs`, `failed_jobs`: Job counts
  - `status`: Batch status

### **Supporting Tables**

#### 6. `twitter_api_configs`

- **Purpose**: Store OAuth app credentials (client_id, client_secret)

#### 7. `users`

- **Purpose**: Microservice admin authentication

---

## 🔧 Setup Instructions

### **Option A: SQLite (Development/Testing)**

```bash
# 1. Create database from schema
sqlite3 gologin_oauth.db < MICROSERVICE_DB_SCHEMA.sql

# 2. Verify tables created
sqlite3 gologin_oauth.db ".tables"

# 3. Test connection with Python
python MICROSERVICE_DB_CONNECTION_EXAMPLE.py
```

### **Option B: PostgreSQL (Production)**

```bash
# 1. Create database
createdb gologin_oauth

# 2. Apply schema
psql gologin_oauth < MICROSERVICE_DB_SCHEMA_POSTGRESQL.sql

# 3. Configure environment
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=gologin_oauth
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=yourpassword
export DB_TYPE=postgres

# 4. Test connection
python MICROSERVICE_DB_CONNECTION_EXAMPLE.py
```

---

## 📊 Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    twitter_accounts                          │
│  - id (PK)                                                   │
│  - account_name                                              │
│  - custom_prompt (CSV_PASSWORD:xxx|2FA_SECRET:xxx)          │
│  - oauth2_access_token                                       │
│  - oauth2_refresh_token                                      │
│  - oauth2_token_expires_at                                   │
└─────────────────────────────────────────────────────────────┘
           ▲
           │
           │ (FK: account_id)
           │
┌──────────┴──────────────────────────────────────────────────┐
│                   gologin_profiles                           │
│  - id (PK)                                                   │
│  - profile_id (UNIQUE)                                       │
│  - execution_mode (cloud/local)                             │
│  - proxy_country, proxy_type                                │
└─────────────────────────────────────────────────────────────┘
           │
           │ (FK: profile_id)
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                oauth_automation_jobs                         │
│  - id (PK)                                                   │
│  - profile_id                                                │
│  - status (pending/running/completed/failed)                │
│  - progress_step                                             │
│  - batch_id                                                  │
└─────────────────────────────────────────────────────────────┘
           │
           │ (FK: job_id)
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              oauth_automation_states                         │
│  - id (PK)                                                   │
│  - state (UNIQUE)                                            │
│  - code_verifier (PKCE)                                      │
│  - used (boolean)                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Connection Helper Usage

### **Basic Usage (SQLite)**

```python
from fix_db_connections import DBConnection

# Use context manager - automatic commit/rollback
with DBConnection(db_path='gologin_oauth.db') as (conn, cursor):
    cursor.execute("SELECT * FROM twitter_accounts WHERE oauth2_access_token IS NULL")
    disconnected_accounts = cursor.fetchall()
```

### **With Connection Pooling**

```python
from fix_db_connections import ConnectionPool, DBConnection

# Initialize pool once at startup
pool = ConnectionPool.get_instance('gologin_oauth.db', max_connections=20)

# DBConnection uses the pool automatically
with DBConnection(db_path='gologin_oauth.db') as (conn, cursor):
    # Your queries here
    pass
```

### **Error Handling**

```python
from fix_db_connections import DBConnection

try:
    with DBConnection(db_path='gologin_oauth.db', max_retries=10) as (conn, cursor):
        # Automatic retry on "database is locked" errors
        cursor.execute("UPDATE twitter_accounts SET is_active = 1 WHERE id = ?", (1,))
except Exception as e:
    print(f"Database error: {e}")
    # Automatically rolled back
```

---

## 🔐 Credential Storage Format

### **twitter_accounts.custom_prompt Field**

The `custom_prompt` field stores account credentials in a specific format:

```
CSV_PASSWORD:actual_password|2FA_SECRET:TOTP_base32_secret
```

**Example:**

```
CSV_PASSWORD:MyP@ssw0rd123|2FA_SECRET:JBSWY3DPEHPK3PXP
```

**Parsing in Python:**

```python
def parse_credentials(custom_prompt):
    credentials = {}
    parts = custom_prompt.split('|')
    for part in parts:
        if part.startswith('CSV_PASSWORD:'):
            credentials['password'] = part.replace('CSV_PASSWORD:', '')
        elif part.startswith('2FA_SECRET:'):
            credentials['2fa_secret'] = part.replace('2FA_SECRET:', '')
    return credentials

# Usage
user_creds = parse_credentials("CSV_PASSWORD:pass123|2FA_SECRET:JBSWY3DP")
print(user_creds['password'])    # 'pass123'
print(user_creds['2fa_secret'])  # 'JBSWY3DP'
```

---

## 🔄 Key Queries for Microservice

### **Get Disconnected Accounts**

```sql
-- SQLite
SELECT account_name, custom_prompt, oauth2_access_token, oauth2_token_expires_at
FROM twitter_accounts
WHERE custom_prompt LIKE 'CSV_PASSWORD:%'
AND (
    oauth2_access_token IS NULL
    OR oauth2_token_expires_at IS NULL
    OR datetime(oauth2_token_expires_at) <= datetime('now')
)
ORDER BY created_at;

-- PostgreSQL
SELECT account_name, custom_prompt, oauth2_access_token, oauth2_token_expires_at
FROM twitter_accounts
WHERE custom_prompt LIKE 'CSV_PASSWORD:%'
AND (
    oauth2_access_token IS NULL
    OR oauth2_token_expires_at IS NULL
    OR oauth2_token_expires_at <= NOW()
)
ORDER BY created_at;
```

### **Create OAuth Job**

```sql
-- SQLite
INSERT INTO oauth_automation_jobs
(profile_id, api_app, status, progress_step, created_at)
VALUES ('profile_123', 'AIOTT1', 'pending', 'initializing', CURRENT_TIMESTAMP);

-- PostgreSQL
INSERT INTO oauth_automation_jobs
(profile_id, api_app, status, progress_step, created_at)
VALUES ('profile_123', 'AIOTT1', 'pending', 'initializing', NOW())
RETURNING id;
```

### **Mark User as Connected**

```sql
-- SQLite
UPDATE twitter_accounts
SET oauth2_access_token = ?,
    oauth2_refresh_token = ?,
    oauth2_token_expires_at = datetime('now', '+30 days'),
    last_token_refresh = CURRENT_TIMESTAMP
WHERE account_name = ?;

-- PostgreSQL
UPDATE twitter_accounts
SET oauth2_access_token = $1,
    oauth2_refresh_token = $2,
    oauth2_token_expires_at = NOW() + INTERVAL '30 days',
    last_token_refresh = NOW()
WHERE account_name = $3;
```

---

## 🚀 Performance Optimizations

### **Connection Pooling**

The `fix_db_connections.py` provides:

- **Connection pooling**: Reuse connections instead of creating new ones
- **Automatic retry**: Handles "database is locked" errors
- **WAL mode**: Better concurrency for SQLite
- **Prepared statements**: Faster query execution

### **Indexes**

All critical fields have indexes:

```sql
-- OAuth jobs
CREATE INDEX idx_oauth_jobs_profile ON oauth_automation_jobs(profile_id);
CREATE INDEX idx_oauth_jobs_status ON oauth_automation_jobs(status);

-- OAuth states
CREATE INDEX idx_oauth_states_state ON oauth_automation_states(state);
CREATE INDEX idx_oauth_states_used ON oauth_automation_states(used);

-- GoLogin profiles
CREATE INDEX idx_gologin_profiles_execution_mode ON gologin_profiles(execution_mode);
```

---

## 📝 Notes

1. **SQLite vs PostgreSQL**: Use SQLite for development/testing, PostgreSQL for production
2. **Credential Security**: The `custom_prompt` field stores passwords in plain text - consider encryption for production
3. **Connection Pooling**: Always use `ConnectionPool` for better performance
4. **WAL Mode**: SQLite uses Write-Ahead Logging for better concurrency
5. **Token Expiry**: Tokens expire after 30 days (configurable)

---

## 🔗 Related Files in AIOTT V2

These files from AIOTT V2 use the same database structure:

- `selenium_oauth_automation.py` - Main automation logic
- `app.py` - REST API routes for OAuth
- `fix_db_connections.py` - Connection pooling (copy this to microservice)

---

## ✅ Checklist for Microservice Setup

- [ ] Choose database (SQLite or PostgreSQL)
- [ ] Create database using provided schema
- [ ] Copy `fix_db_connections.py` to microservice
- [ ] Test connection with example script
- [ ] Configure environment variables
- [ ] Create initial API configs (client_id, client_secret)
- [ ] Import test account credentials
- [ ] Verify GoLogin profiles are created
- [ ] Test OAuth job creation and status tracking

---

## 📚 Additional Resources

- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [OAuth 2.0 PKCE Spec](https://tools.ietf.org/html/rfc7636)
