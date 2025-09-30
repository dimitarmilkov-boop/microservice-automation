#!/usr/bin/env python3
"""
Database Connection Helper for GoLogin OAuth Microservice

This file shows how to use fix_db_connections.py for the microservice.
Copy this pattern for your microservice implementation.
"""

import os
import sys

# Import the DBConnection class from fix_db_connections.py
from fix_db_connections import DBConnection, ConnectionPool, apply_db_fixes

# =====================================================
# CONFIGURATION
# =====================================================

# For SQLite (development/testing)
SQLITE_DB_PATH = 'gologin_oauth.db'

# For PostgreSQL (production)
# You'll need to install psycopg2: pip install psycopg2-binary
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'gologin_oauth')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', '')

# Choose database type
DB_TYPE = os.getenv('DB_TYPE', 'sqlite')  # 'sqlite' or 'postgres'

# =====================================================
# USAGE EXAMPLES
# =====================================================

def example_sqlite_usage():
    """Example of how to use DBConnection with SQLite"""
    
    # Initialize database (call this once at startup)
    apply_db_fixes(SQLITE_DB_PATH, enable_optimization=False)
    
    # Use context manager for database operations
    with DBConnection(db_path=SQLITE_DB_PATH) as (conn, cursor):
        # Example: Get all unauthorized users
        cursor.execute("""
            SELECT account_name, custom_prompt, oauth2_access_token, oauth2_token_expires_at
            FROM twitter_accounts 
            WHERE custom_prompt LIKE 'CSV_PASSWORD:%'
            AND (
                oauth2_access_token IS NULL 
                OR oauth2_token_expires_at IS NULL
                OR datetime(oauth2_token_expires_at) <= datetime('now')
            )
            ORDER BY created_at
        """)
        
        users = cursor.fetchall()
        print(f"Found {len(users)} disconnected users")
        
        # Example: Create a new OAuth job
        cursor.execute("""
            INSERT INTO oauth_automation_jobs 
            (profile_id, api_app, status, progress_step, created_at)
            VALUES (?, ?, 'pending', 'initializing', CURRENT_TIMESTAMP)
        """, ('profile_123', 'AIOTT1'))
        
        job_id = cursor.lastrowid
        print(f"Created job with ID: {job_id}")
        
        # Connection automatically commits and closes


def example_connection_pooling():
    """Example of how to use connection pooling for better performance"""
    
    # Get the singleton connection pool
    pool = ConnectionPool.get_instance(SQLITE_DB_PATH, max_connections=20)
    
    # Use DBConnection as before - it uses the pool automatically
    with DBConnection(db_path=SQLITE_DB_PATH) as (conn, cursor):
        cursor.execute("SELECT COUNT(*) FROM twitter_accounts")
        count = cursor.fetchone()[0]
        print(f"Total accounts: {count}")


def example_error_handling():
    """Example of proper error handling"""
    
    try:
        with DBConnection(db_path=SQLITE_DB_PATH) as (conn, cursor):
            # This will automatically retry if database is locked
            cursor.execute("UPDATE twitter_accounts SET is_active = 1 WHERE id = ?", (1,))
            
    except Exception as e:
        print(f"Database error: {e}")
        # DBConnection automatically rolls back on error


def example_mark_user_connected(username: str):
    """Example: Mark a user as connected after successful OAuth"""
    
    with DBConnection(db_path=SQLITE_DB_PATH) as (conn, cursor):
        cursor.execute("""
            UPDATE twitter_accounts 
            SET oauth2_access_token = ?,
                oauth2_refresh_token = ?,
                oauth2_token_expires_at = datetime('now', '+30 days'),
                last_token_refresh = CURRENT_TIMESTAMP
            WHERE account_name = ?
        """, ('dummy_access_token', 'dummy_refresh_token', username))
        
        print(f"Marked {username} as connected")


def example_get_job_status(job_id: int):
    """Example: Get OAuth job status"""
    
    with DBConnection(db_path=SQLITE_DB_PATH) as (conn, cursor):
        cursor.execute("""
            SELECT id, profile_id, api_app, status, 
                   progress_step, error_message, created_at, completed_at
            FROM oauth_automation_jobs 
            WHERE id = ?
        """, (job_id,))
        
        job = cursor.fetchone()
        if job:
            return {
                'id': job[0],
                'profile_id': job[1],
                'api_app': job[2],
                'status': job[3],
                'progress_step': job[4],
                'error_message': job[5],
                'created_at': job[6],
                'completed_at': job[7]
            }
        return None


# =====================================================
# POSTGRESQL ADAPTER (for production)
# =====================================================

class PostgreSQLConnection:
    """
    Context manager for PostgreSQL connections.
    Similar interface to DBConnection but uses psycopg2.
    """
    
    def __init__(self, max_retries=10, retry_delay=0.1):
        self.conn = None
        self.cursor = None
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
    def __enter__(self):
        import psycopg2
        from psycopg2 import pool
        
        # Create connection
        self.conn = psycopg2.connect(
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            database=POSTGRES_DB,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD
        )
        self.cursor = self.conn.cursor()
        return self.conn, self.cursor
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            if self.conn:
                self.conn.rollback()
        else:
            if self.conn:
                self.conn.commit()
        
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()


def example_postgres_usage():
    """Example of how to use PostgreSQL instead of SQLite"""
    
    with PostgreSQLConnection() as (conn, cursor):
        # PostgreSQL uses different parameter placeholders (%s instead of ?)
        cursor.execute("""
            SELECT account_name, custom_prompt, oauth2_access_token, oauth2_token_expires_at
            FROM twitter_accounts 
            WHERE custom_prompt LIKE %s
            AND (
                oauth2_access_token IS NULL 
                OR oauth2_token_expires_at IS NULL
                OR oauth2_token_expires_at <= NOW()
            )
            ORDER BY created_at
        """, ('CSV_PASSWORD:%',))
        
        users = cursor.fetchall()
        print(f"Found {len(users)} disconnected users")


# =====================================================
# MAIN FUNCTION
# =====================================================

if __name__ == "__main__":
    print("=== GoLogin OAuth Microservice - Database Connection Examples ===\n")
    
    # Run examples
    print("1. Basic SQLite usage:")
    example_sqlite_usage()
    
    print("\n2. Connection pooling:")
    example_connection_pooling()
    
    print("\n3. Error handling:")
    example_error_handling()
    
    print("\n4. Mark user as connected:")
    example_mark_user_connected('test_user')
    
    print("\n5. Get job status:")
    status = example_get_job_status(1)
    print(f"Job status: {status}")
    
    # PostgreSQL example (only if configured)
    if DB_TYPE == 'postgres' and POSTGRES_PASSWORD:
        print("\n6. PostgreSQL usage:")
        try:
            example_postgres_usage()
        except Exception as e:
            print(f"PostgreSQL not available: {e}")
    
    print("\n=== Examples Complete ===")
