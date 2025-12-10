"""
Wipe Database Data Script
Clears all data from tables but preserves the schema.
"""
import sqlite3
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config import Config

def wipe_data():
    db_path = Config.DB_PATH
    print(f"Wiping data from: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    tables = [
        "sessions",
        "engagement_log",
        "daily_limits",
        "scheduled_tasks",
        "scheduled_sessions"
    ]
    
    try:
        for table in tables:
            # Check if table exists first
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone():
                print(f"Clearing table: {table}...")
                cursor.execute(f"DELETE FROM {table}")
            else:
                print(f"Table {table} does not exist (skipping).")
        
        conn.commit()
        print("Data wipe complete.")
        
        # Optional: Reset auto-increment counters
        print("Resetting sequences...")
        cursor.execute("DELETE FROM sqlite_sequence")
        conn.commit()
        
    except Exception as e:
        print(f"Error wiping data: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    confirm = input("Are you sure you want to DELETE ALL DATA? (yes/no): ")
    if confirm.lower() == "yes":
        wipe_data()
    else:
        print("Operation cancelled.")


