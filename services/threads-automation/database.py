import sqlite3
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, db_path="threads_automation.db"):
        self.db_path = db_path
        self._init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        """Initialize database with schema"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            # Sessions table (tracks automation sessions)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    profile_id TEXT NOT NULL,
                    profile_name TEXT,
                    started_at TIMESTAMP,
                    ended_at TIMESTAMP,
                    status TEXT,
                    actions_performed INTEGER DEFAULT 0,
                    errors_count INTEGER DEFAULT 0,
                    log_summary TEXT
                )
            """)

            # Daily limits tracking
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS daily_limits (
                    profile_id TEXT,
                    date DATE,
                    follows_count INTEGER DEFAULT 0,
                    likes_count INTEGER DEFAULT 0,
                    comments_count INTEGER DEFAULT 0,
                    limit_reached BOOLEAN DEFAULT 0,
                    last_updated TIMESTAMP,
                    PRIMARY KEY (profile_id, date)
                )
            """)

            # Detailed action log
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS engagement_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    profile_id TEXT,
                    action_type TEXT, -- 'follow', 'like', 'comment'
                    target_url TEXT,
                    target_username TEXT,
                    status TEXT, -- 'success', 'failed', 'skipped'
                    error_message TEXT,
                    metadata TEXT, -- JSON string for extra data
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES sessions(id)
                )
            """)

            conn.commit()
            conn.close()
            logger.info(f"Database initialized at {self.db_path}")

        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise

    def log_action(self, session_id, profile_id, action_type, target_url, status, error=None, metadata=None):
        """Helper to log a single action"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO engagement_log 
                (session_id, profile_id, action_type, target_url, status, error_message, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (session_id, profile_id, action_type, target_url, status, error, str(metadata) if metadata else None))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to log action: {e}")

    def update_daily_stats(self, profile_id, action_type, count=1):
        """Update daily counters"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            today = datetime.now().date()
            
            # Upsert logic
            column = f"{action_type}s_count" # follow -> follows_count
            cursor.execute(f"""
                INSERT INTO daily_limits (profile_id, date, {column}, last_updated)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(profile_id, date) 
                DO UPDATE SET 
                    {column} = {column} + ?,
                    last_updated = CURRENT_TIMESTAMP
            """, (profile_id, today, count, count))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to update daily stats: {e}")




