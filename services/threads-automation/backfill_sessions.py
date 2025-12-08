"""
Backfill Sessions Script
Reconstructs missing sessions in the sessions table from engagement_log entries.

Run this once to fix historical data where sessions weren't properly created.
"""

import sqlite3
import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from shared.browser_automation.browser_profiles import BrowserProfileManager
from config import Config

def get_profile_name(profile_id: str, profile_cache: dict) -> str:
    """Get profile name from cache or return truncated ID"""
    return profile_cache.get(profile_id, profile_id[:8] if profile_id else "unknown")

def backfill_sessions():
    """Find session_ids in engagement_log that don't exist in sessions, and create them."""
    
    db_path = Config.DB_PATH
    print(f"Using database: {db_path}")
    
    # Build profile name cache
    print("Building profile name cache...")
    profile_cache = {}
    try:
        profile_manager = BrowserProfileManager()
        for name in profile_manager.list_profile_names():
            pid = profile_manager.get_profile_id_by_name(name)
            if pid:
                profile_cache[pid] = name
        print(f"Cached {len(profile_cache)} profiles.")
    except Exception as e:
        print(f"Warning: Could not build profile cache: {e}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Find orphan session_ids in engagement_log
    cursor.execute("""
        SELECT DISTINCT e.session_id, e.profile_id, 
               MIN(e.timestamp) as first_action,
               MAX(e.timestamp) as last_action,
               COUNT(CASE WHEN e.action_type = 'follow' THEN 1 END) as follows,
               COUNT(CASE WHEN e.action_type = 'like' THEN 1 END) as likes,
               COUNT(CASE WHEN e.action_type = 'comment' THEN 1 END) as comments,
               COUNT(CASE WHEN e.status = 'failed' THEN 1 END) as errors
        FROM engagement_log e
        LEFT JOIN sessions s ON e.session_id = s.id
        WHERE s.id IS NULL AND e.session_id IS NOT NULL
        GROUP BY e.session_id, e.profile_id
    """)
    
    orphans = cursor.fetchall()
    
    if not orphans:
        print("No orphan sessions found. All engagement_log entries have matching sessions.")
        conn.close()
        return
    
    print(f"Found {len(orphans)} orphan session(s) to backfill:\n")
    
    backfilled = 0
    for row in orphans:
        session_id, profile_id, first_action, last_action, follows, likes, comments, errors = row
        profile_name = get_profile_name(profile_id, profile_cache)
        
        total_actions = follows + likes + comments
        
        print(f"  Session: {session_id[:8]}...")
        print(f"    Profile: {profile_name} ({profile_id[:8]})")
        print(f"    Time: {first_action} - {last_action}")
        print(f"    Actions: {follows} follows, {likes} likes, {comments} comments")
        
        # Insert the session
        try:
            cursor.execute("""
                INSERT INTO sessions (
                    id, profile_id, profile_name, started_at, ended_at, status,
                    likes_performed, follows_performed, comments_performed, 
                    actions_performed, errors_count, log_summary
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id,
                profile_id,
                profile_name,
                first_action,
                last_action,
                'completed',  # Assume completed since we have log entries
                likes,
                follows,
                comments,
                total_actions,
                errors,
                f"Backfilled from engagement_log on {datetime.now().isoformat()}"
            ))
            backfilled += 1
            print(f"    ✓ Backfilled successfully")
        except sqlite3.IntegrityError as e:
            print(f"    ✗ Already exists or error: {e}")
        
        print()
    
    conn.commit()
    conn.close()
    
    print(f"\nDone! Backfilled {backfilled} session(s).")

def show_stats():
    """Show current database stats"""
    db_path = Config.DB_PATH
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM sessions")
    sessions_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(DISTINCT session_id) FROM engagement_log")
    unique_sessions_in_log = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT COUNT(DISTINCT e.session_id) 
        FROM engagement_log e
        LEFT JOIN sessions s ON e.session_id = s.id
        WHERE s.id IS NULL AND e.session_id IS NOT NULL
    """)
    orphan_count = cursor.fetchone()[0]
    
    print("\n=== Database Stats ===")
    print(f"Sessions table: {sessions_count} entries")
    print(f"Unique sessions in engagement_log: {unique_sessions_in_log}")
    print(f"Orphan sessions (need backfill): {orphan_count}")
    
    conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("THREADS AUTOMATION - SESSION BACKFILL TOOL")
    print("=" * 60)
    
    show_stats()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--run":
        print("\n--- Running Backfill ---\n")
        backfill_sessions()
        print("\n--- After Backfill ---")
        show_stats()
    else:
        print("\nTo run the backfill, use: python backfill_sessions.py --run")

