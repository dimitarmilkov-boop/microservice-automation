"""
Database Setup Script for X-Auth-Service
Creates local SQLite DB, runs schema, and imports test accounts from CSV.
"""

import sqlite3
import csv
import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

# Paths
DB_PATH = Path(__file__).parent.parent / "twitter_accounts.db"
SCHEMA_PATH = project_root / "MICROSERVICE_DB_SCHEMA.sql"
CSV_PATH = project_root / "dump_x.csv"

def create_database():
    """Create SQLite database and run schema."""
    print(f"[DB] Creating database at: {DB_PATH}")
    
    # Delete existing database
    if DB_PATH.exists():
        print("[WARN] Database already exists. Deleting...")
        DB_PATH.unlink()
    
    # Create new database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Read and execute schema
    print(f"[SCHEMA] Reading schema from: {SCHEMA_PATH}")
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    # Execute the entire schema using executescript (handles multiple statements)
    print("[TABLES] Creating tables...")
    try:
        cursor.executescript(schema_sql)
        conn.commit()
        print("[OK] Database schema created!")
    except sqlite3.Error as e:
        print(f"[ERROR] Schema execution failed: {e}")
        raise
    
    return conn

def import_csv_accounts(conn):
    """Import test accounts from CSV."""
    print(f"\n[CSV] Importing accounts from: {CSV_PATH}")
    
    cursor = conn.cursor()
    
    # Read CSV
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        csv_reader = csv.DictReader(f)
        accounts = list(csv_reader)
    
    print(f"[CSV] Found {len(accounts)} accounts to import")
    
    # Import each account
    imported = 0
    for account in accounts:
        username = account['username']
        password = account['password']
        
        # Store password in custom_prompt field (format: CSV_PASSWORD:password)
        custom_prompt = f"CSV_PASSWORD:{password}"
        
        try:
            cursor.execute("""
                INSERT INTO twitter_accounts (
                    account_name,
                    consumer_key,
                    consumer_secret,
                    access_token,
                    access_token_secret,
                    custom_prompt,
                    is_active,
                    oauth_type,
                    app_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                username,
                'placeholder_key',  # Not needed for OAuth2
                'placeholder_secret',
                'placeholder_token',
                'placeholder_token_secret',
                custom_prompt,
                0,  # Not active yet (needs login)
                'oauth2',
                'AIOTT1'
            ))
            imported += 1
            print(f"  [OK] {username}")
        except sqlite3.Error as e:
            print(f"  [ERROR] {username}: {e}")
    
    conn.commit()
    print(f"\n[OK] Imported {imported}/{len(accounts)} accounts successfully!")

def verify_database(conn):
    """Verify database setup."""
    print("\n[VERIFY] Checking database...")
    
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"[TABLES] Created: {len(tables)}")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Check accounts
    cursor.execute("SELECT COUNT(*) FROM twitter_accounts")
    account_count = cursor.fetchone()[0]
    print(f"\n[ACCOUNTS] Twitter accounts: {account_count}")
    
    if account_count > 0:
        cursor.execute("SELECT id, account_name, is_active FROM twitter_accounts LIMIT 5")
        print("\n[SAMPLE] First 5 accounts:")
        for row in cursor.fetchall():
            print(f"  ID: {row[0]} | Username: {row[1]} | Active: {row[2]}")

def main():
    """Main setup function."""
    print("=" * 60)
    print("X-AUTH-SERVICE DATABASE SETUP")
    print("=" * 60)
    
    try:
        # Create database and schema
        conn = create_database()
        
        # Import CSV accounts
        import_csv_accounts(conn)
        
        # Verify setup
        verify_database(conn)
        
        # Close connection
        conn.close()
        
        print("\n" + "=" * 60)
        print("[SUCCESS] DATABASE SETUP COMPLETE!")
        print("=" * 60)
        print(f"\n[PATH] Database location: {DB_PATH}")
        print(f"[STATUS] Ready for testing!\n")
        
        return 0
    
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())