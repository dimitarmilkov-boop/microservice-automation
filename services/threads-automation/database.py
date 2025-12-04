"""
Threads Automation Service - Database Operations
Handles all SQLite database interactions for tracking actions, likes, follows, and sessions
Modeled after ig-engagement-service database structure
"""

import sqlite3
import json
import logging
from datetime import datetime, date
from pathlib import Path
from typing import List, Dict, Optional
from contextlib import contextmanager

logger = logging.getLogger(__name__)


class Database:
    """Manages all database operations for Threads automation tracking"""
    
    def __init__(self, db_path="threads_automation.db"):
        self.db_path = db_path
        self._init_db()
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        try:
            yield conn
        finally:
            conn.close()
    
    def get_connection(self):
        """Legacy method for backward compatibility"""
        return sqlite3.connect(str(self.db_path))
    
    def _init_db(self):
        """Initialize database with schema"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()

                # =====================================================
                # 1. SESSIONS TABLE - Tracks automation sessions
                # =====================================================
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sessions (
                        id TEXT PRIMARY KEY,
                        profile_id TEXT NOT NULL,
                        profile_name TEXT,
                        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        ended_at TIMESTAMP,
                        status TEXT DEFAULT 'running',
                        likes_performed INTEGER DEFAULT 0,
                        follows_performed INTEGER DEFAULT 0,
                        comments_performed INTEGER DEFAULT 0,
                        actions_performed INTEGER DEFAULT 0,
                        errors_count INTEGER DEFAULT 0,
                        log_summary TEXT
                    )
                """)
                
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_profile ON sessions(profile_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at)")

                # =====================================================
                # 2. DAILY LIMITS TABLE - Tracks daily action counts
                # =====================================================
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS daily_limits (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        profile_id TEXT NOT NULL,
                        date DATE NOT NULL,
                        follows_count INTEGER DEFAULT 0,
                        likes_count INTEGER DEFAULT 0,
                        comments_count INTEGER DEFAULT 0,
                        limit_reached BOOLEAN DEFAULT 0,
                        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(profile_id, date)
                    )
                """)
                
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_daily_profile_date ON daily_limits(profile_id, date)")

                # =====================================================
                # 3. ENGAGEMENT LOG TABLE - Detailed action log with usernames
                # =====================================================
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS engagement_log (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        session_id TEXT,
                        profile_id TEXT NOT NULL,
                        action_type TEXT NOT NULL,
                        target_username TEXT,
                        target_url TEXT,
                        status TEXT DEFAULT 'success',
                        error_message TEXT,
                        metadata TEXT,
                        screenshot_path TEXT,
                        FOREIGN KEY (session_id) REFERENCES sessions(id)
                    )
                """)
                
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_log_timestamp ON engagement_log(timestamp)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_log_profile ON engagement_log(profile_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_log_action ON engagement_log(action_type)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_log_session ON engagement_log(session_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_log_username ON engagement_log(target_username)")

                conn.commit()
                logger.info(f"Database initialized at {self.db_path}")

        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise

    # ========================================
    # SESSION OPERATIONS
    # ========================================
    
    def create_session(self, session_id: str, profile_id: str, profile_name: str = None) -> str:
        """Create a new execution session"""
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO sessions (id, profile_id, profile_name, status)
                VALUES (?, ?, ?, 'running')
                """,
                (session_id, profile_id, profile_name)
            )
            conn.commit()
        logger.info(f"Created session {session_id} for profile {profile_id}")
        return session_id
    
    def update_session(self, session_id: str, **kwargs):
        """Update session statistics"""
        allowed_fields = ['status', 'ended_at', 'likes_performed', 'follows_performed', 
                         'comments_performed', 'actions_performed', 'errors_count', 'log_summary']
        
        updates = []
        values = []
        for field, value in kwargs.items():
            if field in allowed_fields:
                updates.append(f"{field} = ?")
                values.append(value)
        
        if not updates:
            return
        
        values.append(session_id)
        sql = f"UPDATE sessions SET {', '.join(updates)} WHERE id = ?"
        
        with self._get_connection() as conn:
            conn.execute(sql, values)
            conn.commit()
    
    def complete_session(self, session_id: str, stats: Dict):
        """Mark session as completed with final stats"""
        self.update_session(
            session_id, 
            status='completed',
            ended_at=datetime.now().isoformat(),
            likes_performed=stats.get('likes', 0),
            follows_performed=stats.get('follows', 0),
            comments_performed=stats.get('comments', 0),
            actions_performed=sum(stats.values()),
            errors_count=stats.get('errors', 0)
        )

    # ========================================
    # ENGAGEMENT LOG OPERATIONS
    # ========================================

    def log_action(self, session_id: str, profile_id: str, action_type: str, 
                   target_username: str = None, target_url: str = None,
                   status: str = 'success', error: str = None, 
                   metadata: Dict = None, screenshot_path: str = None):
        """Log a single engagement action with full details"""
        try:
            metadata_json = json.dumps(metadata) if metadata else None
            
            with self._get_connection() as conn:
                conn.execute("""
                    INSERT INTO engagement_log 
                    (session_id, profile_id, action_type, target_username, target_url, 
                     status, error_message, metadata, screenshot_path)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (session_id, profile_id, action_type, target_username, target_url,
                      status, error, metadata_json, screenshot_path))
                conn.commit()
            
            logger.debug(f"Logged action: {action_type} @{target_username} - {status}")
        except Exception as e:
            logger.error(f"Failed to log action: {e}")

    def get_recent_actions(self, profile_id: str = None, limit: int = 50) -> List[Dict]:
        """Get recent engagement actions"""
        with self._get_connection() as conn:
            if profile_id:
                cursor = conn.execute(
                    """
                    SELECT * FROM engagement_log 
                    WHERE profile_id = ?
                    ORDER BY timestamp DESC LIMIT ?
                    """,
                    (profile_id, limit)
                )
            else:
                cursor = conn.execute(
                    "SELECT * FROM engagement_log ORDER BY timestamp DESC LIMIT ?",
                    (limit,)
                )
            return [dict(row) for row in cursor.fetchall()]

    def get_session_actions(self, session_id: str) -> List[Dict]:
        """Get all actions for a specific session"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM engagement_log WHERE session_id = ? ORDER BY timestamp ASC",
                (session_id,)
            )
            return [dict(row) for row in cursor.fetchall()]

    # ========================================
    # DAILY STATS OPERATIONS
    # ========================================

    def update_daily_stats(self, profile_id: str, action_type: str, count: int = 1):
        """Update daily counters for a specific action type"""
        try:
            today = date.today().isoformat()
            column_map = {
                'follow': 'follows_count',
                'like': 'likes_count', 
                'comment': 'comments_count'
            }
            column = column_map.get(action_type)
            
            if not column:
                logger.warning(f"Unknown action type: {action_type}")
                return
            
            with self._get_connection() as conn:
                conn.execute(f"""
                    INSERT INTO daily_limits (profile_id, date, {column}, last_updated)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(profile_id, date) 
                    DO UPDATE SET 
                        {column} = {column} + ?,
                        last_updated = CURRENT_TIMESTAMP
                """, (profile_id, today, count, count))
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to update daily stats: {e}")

    def get_daily_stats(self, profile_id: str, target_date: date = None) -> Dict:
        """Get daily stats for a profile"""
        if target_date is None:
            target_date = date.today()
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM daily_limits WHERE profile_id = ? AND date = ?",
                (profile_id, target_date.isoformat())
            )
            row = cursor.fetchone()
            if row:
                return dict(row)
            return {'follows_count': 0, 'likes_count': 0, 'comments_count': 0}

    def is_daily_limit_reached(self, profile_id: str, action_type: str, limit: int) -> bool:
        """Check if daily limit has been reached for an action type"""
        stats = self.get_daily_stats(profile_id)
        column_map = {
            'follow': 'follows_count',
            'like': 'likes_count',
            'comment': 'comments_count'
        }
        column = column_map.get(action_type, 'likes_count')
        current = stats.get(column, 0)
        return current >= limit

    # ========================================
    # STATISTICS & REPORTING
    # ========================================

    def get_session_summary(self, session_id: str) -> Dict:
        """Get summary for a specific session"""
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
            row = cursor.fetchone()
            return dict(row) if row else {}

    def get_all_sessions(self, limit: int = 20) -> List[Dict]:
        """Get all sessions ordered by start time"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?",
                (limit,)
            )
            return [dict(row) for row in cursor.fetchall()]

    def get_profile_total_stats(self, profile_id: str) -> Dict:
        """Get total stats for a profile across all time"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT 
                    COUNT(CASE WHEN action_type = 'like' AND status = 'success' THEN 1 END) as total_likes,
                    COUNT(CASE WHEN action_type = 'follow' AND status = 'success' THEN 1 END) as total_follows,
                    COUNT(CASE WHEN action_type = 'comment' AND status = 'success' THEN 1 END) as total_comments,
                    COUNT(*) as total_actions,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as total_errors
                FROM engagement_log
                WHERE profile_id = ?
                """,
                (profile_id,)
            )
            row = cursor.fetchone()
            return dict(row) if row else {}
