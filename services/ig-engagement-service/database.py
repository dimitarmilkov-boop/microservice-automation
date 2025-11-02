"""
Instagram Engagement Service - Database Operations
Handles all SQLite database interactions for tracking posts, likes, and sessions
"""

import sqlite3
import json
import uuid
from datetime import datetime, date, time as dt_time
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages all database operations for Instagram engagement tracking"""
    
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize database with schema"""
        schema_path = Path(__file__).parent.parent.parent / 'shared' / 'ig_db_schema.sql'
        
        if not schema_path.exists():
            raise FileNotFoundError(f"Database schema not found at {schema_path}")
        
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        with self._get_connection() as conn:
            conn.executescript(schema_sql)
            conn.commit()
        
        logger.info(f"Database initialized at {self.db_path}")
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        try:
            yield conn
        finally:
            conn.close()
    
    # ========================================
    # PROCESSED POSTS OPERATIONS
    # ========================================
    
    def is_post_processed(self, post_url: str) -> bool:
        """Check if a post has already been processed"""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT 1 FROM processed_posts WHERE post_url = ? LIMIT 1",
                (post_url,)
            )
            return cursor.fetchone() is not None
    
    def add_processed_post(self, post_url: str, instagram_username: str, 
                          profile_id: str, comments_liked: int, 
                          status: str = 'completed', notes: Optional[str] = None):
        """Record a processed post"""
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO processed_posts 
                (post_url, instagram_username, profile_id, comments_liked, status, notes)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (post_url, instagram_username, profile_id, comments_liked, status, notes)
            )
            conn.commit()
        logger.debug(f"Added processed post: {post_url}")
    
    # ========================================
    # DAILY LIKES OPERATIONS
    # ========================================
    
    def get_daily_likes(self, profile_id: str, target_date: Optional[date] = None) -> int:
        """Get current like count for a profile on a specific date"""
        if target_date is None:
            target_date = date.today()
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT like_count FROM daily_likes WHERE profile_id = ? AND date = ?",
                (profile_id, target_date.isoformat())
            )
            row = cursor.fetchone()
            return row['like_count'] if row else 0
    
    def increment_daily_likes(self, profile_id: str, count: int = 1, 
                             target_date: Optional[date] = None) -> int:
        """Increment daily like count for a profile"""
        if target_date is None:
            target_date = date.today()
        
        with self._get_connection() as conn:
            # Insert or update
            conn.execute(
                """
                INSERT INTO daily_likes (profile_id, date, like_count, last_updated)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(profile_id, date) DO UPDATE SET
                    like_count = like_count + ?,
                    last_updated = CURRENT_TIMESTAMP
                """,
                (profile_id, target_date.isoformat(), count, count)
            )
            conn.commit()
            
            # Get updated count
            cursor = conn.execute(
                "SELECT like_count FROM daily_likes WHERE profile_id = ? AND date = ?",
                (profile_id, target_date.isoformat())
            )
            row = cursor.fetchone()
            new_count = row['like_count'] if row else 0
            
        logger.debug(f"Daily likes for {profile_id}: {new_count}")
        return new_count
    
    def is_daily_limit_reached(self, profile_id: str, limit: int, 
                               target_date: Optional[date] = None) -> bool:
        """Check if daily like limit has been reached"""
        current = self.get_daily_likes(profile_id, target_date)
        return current >= limit
    
    # ========================================
    # SCHEDULED SESSIONS OPERATIONS
    # ========================================
    
    def add_scheduled_session(self, profile_id: str, profile_name: str, 
                             scheduled_datetime: datetime, posts_target: int = 5):
        """Schedule a session for a profile"""
        scheduled_date = scheduled_datetime.date()
        scheduled_time = scheduled_datetime.time()
        
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT OR IGNORE INTO scheduled_sessions 
                (profile_id, profile_name, scheduled_date, scheduled_time, 
                 scheduled_datetime, posts_target)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (profile_id, profile_name, scheduled_date.isoformat(), 
                 scheduled_time.isoformat(), scheduled_datetime.isoformat(), posts_target)
            )
            conn.commit()
        logger.debug(f"Scheduled session for {profile_name} at {scheduled_datetime}")
    
    def get_pending_sessions(self, current_time: Optional[datetime] = None) -> List[Dict]:
        """Get all pending sessions that are due to run"""
        if current_time is None:
            current_time = datetime.now()
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                SELECT * FROM scheduled_sessions 
                WHERE status = 'pending' AND scheduled_datetime <= ?
                ORDER BY scheduled_datetime ASC
                """,
                (current_time.isoformat(),)
            )
            return [dict(row) for row in cursor.fetchall()]
    
    def update_session_status(self, session_id: int, status: str, 
                             session_uuid: Optional[str] = None, 
                             error_message: Optional[str] = None):
        """Update status of a scheduled session"""
        with self._get_connection() as conn:
            if status == 'running':
                conn.execute(
                    """
                    UPDATE scheduled_sessions 
                    SET status = ?, started_at = CURRENT_TIMESTAMP, session_id = ?
                    WHERE id = ?
                    """,
                    (status, session_uuid, session_id)
                )
            elif status in ['completed', 'failed', 'skipped']:
                conn.execute(
                    """
                    UPDATE scheduled_sessions 
                    SET status = ?, completed_at = CURRENT_TIMESTAMP, error_message = ?
                    WHERE id = ?
                    """,
                    (status, error_message, session_id)
                )
            else:
                conn.execute(
                    "UPDATE scheduled_sessions SET status = ? WHERE id = ?",
                    (status, session_id)
                )
            conn.commit()
        logger.debug(f"Updated session {session_id} status to {status}")
    
    def clear_old_scheduled_sessions(self, days_old: int = 7):
        """Remove old completed sessions"""
        cutoff_date = datetime.now().date()
        cutoff_date = cutoff_date.replace(day=cutoff_date.day - days_old)
        
        with self._get_connection() as conn:
            conn.execute(
                """
                DELETE FROM scheduled_sessions 
                WHERE scheduled_date < ? AND status IN ('completed', 'failed', 'skipped')
                """,
                (cutoff_date.isoformat(),)
            )
            conn.commit()
        logger.info(f"Cleared scheduled sessions older than {days_old} days")
    
    # ========================================
    # SESSIONS (EXECUTION) OPERATIONS
    # ========================================
    
    def create_session(self, profile_id: str) -> str:
        """Create a new execution session"""
        session_id = str(uuid.uuid4())
        
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO sessions (id, profile_id, status)
                VALUES (?, ?, 'running')
                """,
                (session_id, profile_id)
            )
            conn.commit()
        
        logger.info(f"Created session {session_id} for profile {profile_id}")
        return session_id
    
    def update_session(self, session_id: str, **kwargs):
        """Update session statistics"""
        allowed_fields = ['status', 'likes_performed', 'accounts_processed', 
                         'posts_processed', 'errors_count', 'ended_at']
        
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
        logger.debug(f"Updated session {session_id}")
    
    def complete_session(self, session_id: str):
        """Mark session as completed"""
        self.update_session(session_id, status='completed', 
                          ended_at=datetime.now().isoformat())
    
    # ========================================
    # ENGAGEMENT LOG OPERATIONS
    # ========================================
    
    def log_action(self, profile_id: str, action: str, session_id: str,
                   target_url: Optional[str] = None, 
                   instagram_username: Optional[str] = None,
                   success: bool = True, error_message: Optional[str] = None,
                   metadata: Optional[Dict] = None):
        """Log an engagement action"""
        metadata_json = json.dumps(metadata) if metadata else None
        
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO engagement_log 
                (profile_id, action, target_url, instagram_username, 
                 success, error_message, metadata, session_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (profile_id, action, target_url, instagram_username, 
                 success, error_message, metadata_json, session_id)
            )
            conn.commit()
    
    # ========================================
    # TARGET ACCOUNTS OPERATIONS
    # ========================================
    
    def get_target_accounts(self, active_only: bool = True) -> List[str]:
        """Get list of target Instagram usernames"""
        with self._get_connection() as conn:
            if active_only:
                cursor = conn.execute(
                    "SELECT username FROM target_accounts WHERE is_active = 1"
                )
            else:
                cursor = conn.execute("SELECT username FROM target_accounts")
            return [row['username'] for row in cursor.fetchall()]
    
    def add_target_account(self, username: str):
        """Add a target account to database"""
        with self._get_connection() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO target_accounts (username) VALUES (?)",
                (username,)
            )
            conn.commit()
    
    def update_target_account_processed(self, username: str):
        """Update last processed time for a target account"""
        with self._get_connection() as conn:
            conn.execute(
                """
                UPDATE target_accounts 
                SET last_processed_at = CURRENT_TIMESTAMP,
                    posts_processed = posts_processed + 1
                WHERE username = ?
                """,
                (username,)
            )
            conn.commit()
    
    # ========================================
    # STATISTICS & REPORTING
    # ========================================
    
    def get_daily_summary(self, target_date: Optional[date] = None) -> List[Dict]:
        """Get daily summary for all profiles"""
        if target_date is None:
            target_date = date.today()
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM daily_summary WHERE date = ?",
                (target_date.isoformat(),)
            )
            return [dict(row) for row in cursor.fetchall()]
    
    def get_profile_stats(self, profile_id: Optional[str] = None) -> List[Dict]:
        """Get statistics for profile(s)"""
        with self._get_connection() as conn:
            if profile_id:
                cursor = conn.execute(
                    "SELECT * FROM profile_stats WHERE profile_id = ?",
                    (profile_id,)
                )
            else:
                cursor = conn.execute("SELECT * FROM profile_stats")
            return [dict(row) for row in cursor.fetchall()]

