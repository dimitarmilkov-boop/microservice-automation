#!/usr/bin/env python3
import sqlite3
import logging
import sys
import os
import tempfile
import time
import threading

# Import resource module only on Unix-like systems
try:
    import resource
    HAS_RESOURCE = True
except ImportError:
    # Windows doesn't have the resource module
    HAS_RESOURCE = False
from queue import Queue, Empty, Full
from threading import local
import random
from contextlib import contextmanager
from threading import Lock
import argparse

# Determine the base directory for logs
if os.path.exists('/opt/twitter-app'):
    # Production environment
    base_dir = '/opt/twitter-app'
    logs_dir = os.path.join(base_dir, 'logs')
else:
    # Development environment
    base_dir = os.path.dirname(os.path.abspath(__file__))
    logs_dir = os.path.join(base_dir, 'logs')

# Try to create logs directory if it doesn't exist
try:
    os.makedirs(logs_dir, exist_ok=True)
    log_file_path = os.path.join(logs_dir, 'fix_db_connections.log')
except (PermissionError, OSError):
    # Fallback to temp directory if we can't create or access the logs directory
    logs_dir = tempfile.gettempdir()
    log_file_path = os.path.join(logs_dir, 'fix_db_connections.log')
    print(f"Warning: Could not access or create logs directory. Using temporary directory: {logs_dir}")

# Configure logging with error handling
handlers = [logging.StreamHandler(sys.stdout)]
try:
    from logging.handlers import TimedRotatingFileHandler
    # Set up log rotation - rotate daily, keep 30 days of logs
    file_handler = TimedRotatingFileHandler(
        log_file_path,
        when='midnight',
        interval=1,
        backupCount=30
    )
    handlers.append(file_handler)
except (PermissionError, OSError, ImportError) as e:
    print(f"Warning: Could not create log file at {log_file_path}: {e}")
    print("Continuing with console logging only.")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=handlers
)

logger = logging.getLogger('fix_db_connections')

def increase_file_limit():
    """
    Increase the maximum number of open files for the current process.
    This helps prevent "Too many open files" errors.
    Only applies to Unix-like systems - Windows handles this differently.
    """
    if not HAS_RESOURCE:
        logger.info("File limit management not available on Windows - skipping")
        return True
        
    try:
        soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE)
        logger.info(f"Current file limits: soft={soft}, hard={hard}")
        
        # Try to increase to hard limit or a reasonable value
        new_soft = min(hard, 4096)
        resource.setrlimit(resource.RLIMIT_NOFILE, (new_soft, hard))
        
        new_soft, new_hard = resource.getrlimit(resource.RLIMIT_NOFILE)
        logger.info(f"New file limits: soft={new_soft}, hard={new_hard}")
        return True
    except Exception as e:
        logger.error(f"Failed to increase file limit: {e}")
        return False

class ConnectionPool:
    """
    A connection pool for SQLite database connections.
    This helps limit the number of concurrent connections and reuse existing ones.
    """
    _instance = None
    _lock = threading.Lock()
    
    @classmethod
    def get_instance(cls, db_path='twitter_accounts.db', max_connections=20):
        """Singleton pattern to ensure only one pool exists"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = ConnectionPool(db_path, max_connections)
        return cls._instance
    
    def __init__(self, db_path='twitter_accounts.db', max_connections=20):
        """
        Initialize the connection pool.
        
        Args:
            db_path (str): Path to the SQLite database file
            max_connections (int): Maximum number of connections to keep in the pool
        """
        # If we're in production and the path doesn't include the full path, add it
        if os.path.exists('/opt/twitter-app') and not os.path.isabs(db_path):
            self.db_path = os.path.join('/opt/twitter-app', db_path)
        else:
            self.db_path = db_path
            
        self.max_connections = max_connections
        self.pool = Queue(maxsize=max_connections)
        self.active_connections = 0
        self.lock = threading.Lock()
        self.connection_timeout = 120  # 2 minutes timeout
        
        logger.info(f"Initializing connection pool for {self.db_path} with max {max_connections} connections")
        
        # Pre-populate the pool with a few connections
        initial_connections = min(5, max_connections)
        for _ in range(initial_connections):
            try:
                conn = self._create_connection()
                self.pool.put(conn)
                logger.debug(f"Added initial connection to pool ({self.pool.qsize()}/{max_connections})")
            except Exception as e:
                logger.error(f"Failed to create initial connection: {e}")
    
    def _create_connection(self):
        """Create a new SQLite connection with thread safety enabled"""
        try:
            print(f"\n{'='*80}")
            print(f"[CONNECTION] Creating SQLite connection to: {self.db_path}")
            print(f"[CONNECTION] Absolute path: {os.path.abspath(self.db_path)}")
            print(f"[CONNECTION] File exists: {os.path.exists(self.db_path)}")
            print(f"[CONNECTION] File size: {os.path.getsize(self.db_path) if os.path.exists(self.db_path) else 'N/A'} bytes")
            print(f"{'='*80}\n")
            
            # Add check_same_thread=False to allow connections to be used across threads
            conn = sqlite3.connect(self.db_path, timeout=self.connection_timeout, check_same_thread=False)
            conn.execute("PRAGMA foreign_keys = ON")
            conn.execute("PRAGMA journal_mode=WAL")  # Use WAL mode for better concurrency
            conn.execute("PRAGMA busy_timeout=60000")  # Set busy timeout to 60 seconds
            conn.execute("PRAGMA synchronous=NORMAL")  # Slightly less durability for better performance
            conn.execute("PRAGMA temp_store=MEMORY")  # Use memory for temp tables
            conn.execute("PRAGMA mmap_size=30000000000")  # Use memory-mapped I/O
            return conn
        except Exception as e:
            logger.error(f"Error creating database connection: {e}")
            raise
    
    def get_connection(self, timeout=30):
        """
        Get a connection from the pool or create a new one if needed.
        
        Args:
            timeout (int): Timeout in seconds to wait for a connection
            
        Returns:
            sqlite3.Connection: A database connection
        """
        conn = None
        try:
            # Try to get a connection from the pool (non-blocking)
            conn = self.pool.get(block=False)
            logger.debug(f"Reused connection from pool ({self.pool.qsize()}/{self.max_connections})")
            return conn
        except Empty:
            # If pool is empty, create a new connection if under the limit
            with self.lock:
                if self.active_connections < self.max_connections:
                    self.active_connections += 1
                    logger.debug(f"Creating new connection ({self.active_connections}/{self.max_connections})")
                    return self._create_connection()
                else:
                    # If at the limit, wait for a connection to become available
                    logger.warning(f"Connection pool exhausted, waiting for available connection")
                    try:
                        return self.pool.get(block=True, timeout=timeout)
                    except Empty:
                        logger.error("Timed out waiting for database connection")
                        raise Exception("Connection pool timeout - no connections available")
    
    def return_connection(self, conn):
        """
        Return a connection to the pool or close it if the pool is full.
        
        Args:
            conn (sqlite3.Connection): The connection to return
        """
        if conn is None:
            return
            
        try:
            # Try to return the connection to the pool
            self.pool.put(conn, block=False)
            logger.debug(f"Returned connection to pool ({self.pool.qsize()}/{self.max_connections})")
        except Full:
            # If the pool is full, close the connection
            with self.lock:
                self.active_connections -= 1
            conn.close()
            logger.debug(f"Closed connection (pool full)")
    
    def close_all(self):
        """Close all connections in the pool"""
        logger.info("Closing all connections in the pool")
        while not self.pool.empty():
            try:
                conn = self.pool.get(block=False)
                conn.close()
            except Empty:
                break
            except Exception as e:
                logger.error(f"Error closing connection: {e}")

class DBConnection:
    """Context manager for database connections with retry logic for locks"""
    _lock = threading.Lock()  # Class-level lock for database access
    
    def __init__(self, db_path=None, max_retries=10, retry_delay=0.1):
        self.conn = None
        self.cursor = None
        self.db_path = db_path or 'twitter_accounts.db'
        self.max_retries = int(max_retries)
        self.retry_delay = float(retry_delay)
        self.pool = ConnectionPool.get_instance(self.db_path)

    def __enter__(self):
        retries = 0
        last_error = None
        
        while retries < self.max_retries:
            try:
                # Use connection pool instead of creating new connection
                self.conn = self.pool.get_connection()
                self.cursor = self.conn.cursor()
                return self.conn, self.cursor
            except sqlite3.OperationalError as e:
                if "database is locked" in str(e):
                    retries += 1
                    last_error = e
                    if retries >= self.max_retries:
                        logger.error(f"Database connection failed after {self.max_retries} retries")
                        raise
                    # Exponential backoff with jitter
                    delay = self.retry_delay * (2 ** retries) * (1 + random.random() * 0.1)
                    logger.warning(f"Database locked, attempt {retries}/{self.max_retries}. Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                else:
                    raise
            except Exception as e:
                logger.error(f"Database connection error: {e}")
                raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            logger.error(f"Database error: {exc_type} - {exc_val}")
            if self.conn:
                try:
                    self.conn.rollback()
                except Exception as e:
                    logger.error(f"Error rolling back transaction: {e}")
        else:
            if self.conn:
                try:
                    self.conn.commit()
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e):
                        logger.warning("Database locked during commit, rolling back")
                        try:
                            self.conn.rollback()
                        except Exception as rollback_error:
                            logger.error(f"Error rolling back after failed commit: {rollback_error}")
                    else:
                        raise
                except Exception as e:
                    logger.error(f"Error committing transaction: {e}")
                    try:
                        self.conn.rollback()
                    except Exception as rollback_error:
                        logger.error(f"Error rolling back after failed commit: {rollback_error}")
        
        # Always try to close resources
        try:
            if self.cursor:
                self.cursor.close()
        except Exception as e:
            logger.error(f"Error closing cursor: {e}")
            
        try:
            if self.conn:
                self.pool.return_connection(self.conn)
        except Exception as e:
            logger.error(f"Error returning connection to pool: {e}")
            try:
                self.conn.close()
            except Exception as close_error:
                logger.error(f"Error closing connection: {close_error}")

class DatabaseOptimizer:
    """Singleton class to handle database optimization"""
    _instance = None
    _lock = threading.Lock()
    _optimization_lock = threading.Lock()
    _optimization_enabled = False  # Flag to control when optimization should run
    
    @classmethod
    def get_instance(cls):
        """Get the singleton instance"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = DatabaseOptimizer()
        return cls._instance
    
    def __init__(self):
        """Initialize the optimizer"""
        self._optimization_enabled = False  # Disabled by default
    
    def enable_optimization(self):
        """Enable database optimization"""
        self._optimization_enabled = True
        logger.info("Database optimization enabled")
    
    def disable_optimization(self):
        """Disable database optimization"""
        self._optimization_enabled = False
        logger.info("Database optimization disabled")
    
    def optimize_if_needed(self, db_path):
        """Optimize the database if enabled and needed"""
        if not self._optimization_enabled:
            logger.info("Database optimization is disabled")
            return
            
        with self._optimization_lock:
            try:
                self._run_optimization(db_path)
            except Exception as e:
                logger.error(f"Error during database optimization: {e}")
    
    def _run_optimization(self, db_path):
        """Run database optimization with proper connection handling"""
        logger.info(f"Optimizing database {db_path}...")
        
        # Use connection pool for optimization
        pool = ConnectionPool.get_instance(db_path)
        conn = None
        try:
            conn = pool.get_connection()
            c = conn.cursor()
            
            # Get current database size
            current_size = os.path.getsize(db_path)
            
            # Get last vacuum size
            c.execute("""
                CREATE TABLE IF NOT EXISTS db_maintenance (
                    key TEXT PRIMARY KEY,
                    value INTEGER
                )
            """)
            
            c.execute("SELECT value FROM db_maintenance WHERE key='last_vacuum_size'")
            result = c.fetchone()
            last_vacuum_size = result[0] if result else 0
            
            # Only run VACUUM if database has grown by more than 50%
            if current_size > last_vacuum_size * 1.5:
                logger.info(f"Running VACUUM to defragment the database... (current size: {current_size}, last vacuum: {last_vacuum_size})")
                c.execute("VACUUM")
                
                # Update last vacuum size
                c.execute("""
                    INSERT OR REPLACE INTO db_maintenance (key, value)
                    VALUES ('last_vacuum_size', ?)
                """, (current_size,))
            else:
                logger.info(f"Skipping VACUUM - database size hasn't grown significantly (current: {current_size}, last vacuum: {last_vacuum_size})")
            
            # Always run ANALYZE to update statistics
            logger.info("Running ANALYZE to update statistics...")
            c.execute("ANALYZE")
            
            # Check database integrity
            logger.info("Checking database integrity...")
            c.execute("PRAGMA integrity_check")
            integrity_result = c.fetchone()[0]
            if integrity_result == 'ok':
                logger.info("Database integrity check passed")
            else:
                logger.error(f"Database integrity check failed: {integrity_result}")
            
            conn.commit()
            
        except Exception as e:
            if conn:
                try:
                    conn.rollback()
                except Exception as rollback_error:
                    logger.error(f"Error rolling back optimization transaction: {rollback_error}")
            raise
        finally:
            if conn:
                pool.return_connection(conn)

def apply_db_fixes(db_path='twitter_accounts.db', enable_optimization=False):
    """
    Apply database fixes and optimizations.
    
    Args:
        db_path (str): Path to the database file
        enable_optimization (bool): Whether to enable database optimization
    """
    try:
        # Increase file limits
        increase_file_limit()
        
        # Initialize connection pool
        pool = ConnectionPool.get_instance(db_path)
        
        # Only run optimization if explicitly enabled
        if enable_optimization:
            optimizer = DatabaseOptimizer.get_instance()
            optimizer.enable_optimization()
            optimizer.optimize_if_needed(db_path)
        
        logger.info("Database connection fixes applied successfully")
        return True
    except Exception as e:
        logger.error(f"Error applying database fixes: {e}")
        return False

# Only run apply_db_fixes when this script is run directly
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Apply database fixes and optimizations')
    parser.add_argument('--db-path', default='twitter_accounts.db', help='Path to the database file')
    parser.add_argument('--enable-optimization', action='store_true', help='Enable database optimization')
    args = parser.parse_args()
    
    apply_db_fixes(args.db_path, enable_optimization=args.enable_optimization)
