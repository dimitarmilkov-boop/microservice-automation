import sys
import os
import argparse
import logging
import traceback

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

print("Starting run_post.py...", flush=True)

try:
    # Add project root to path
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
    sys.path.append(project_root)
    print(f"Added project root to path: {project_root}")

    # Load .env manually like server.py
    env_path = os.path.join(project_root, '.env')
    if os.path.exists(env_path):
        print(f"Loading .env from {env_path}")
        with open(env_path, 'r', encoding='utf-8-sig') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
    else:
        print(f"Warning: .env not found at {env_path}")

    from threads_post_worker import ThreadsPostWorker
    from database import Database
    from config import Config
    print("Imports successful.")
except Exception as e:
    print(f"Import Error: {e}")
    traceback.print_exc()
    sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    print("Entering main function...")
    parser = argparse.ArgumentParser(description="Threads Post Automation")
    parser.add_argument("--profile", required=True, help="GoLogin Profile ID")
    parser.add_argument("--force", action="store_true", help="Ignore daily limits")
    
    args = parser.parse_args()
    
    print(f"Starting Threads Poster for Profile: {args.profile}")
    
    try:
        print("Initializing DB...")
        db = Database(Config.DB_PATH)
        print("Initializing Worker...")
        worker = ThreadsPostWorker(args.profile, db=db)
        
        # Optional: override settings if needed, or rely on worker logic
        if args.force:
            print("Force mode enabled: Ignoring daily limits.")
            worker.settings['max_posts_per_day'] = 999
            
        print("Starting Worker...")
        worker.start()
        print("Worker finished.")
        
    except Exception as e:
        logger.error(f"Failed to run poster: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
