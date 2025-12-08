from fastapi import FastAPI, Request, BackgroundTasks, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn
import logging
import os
import threading
import json
import ast
import time
import random
import sys
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pydantic import BaseModel

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
sys.path.append(PROJECT_ROOT)

# Load .env from project root (with BOM handling for Windows)
env_path = os.path.join(PROJECT_ROOT, '.env')
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()
    print(f"Loaded .env from {env_path}")
else:
    print(f"Warning: .env not found at {env_path}")

from shared.browser_automation.browser_profiles import BrowserProfileManager
from threads_growth_worker import ThreadsGrowthWorker
from threads_comment_worker import ThreadsCommentWorker
from database import Database
from config import Config

# Setup Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Threads Automation Service")

# Mount Static & Templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# Database
db = Database(Config.DB_PATH)

# Profile Manager
profile_manager = BrowserProfileManager()

# Global State
active_workers = {}
worker_locks = {} # profile_id -> Lock

# Scheduler Loop
def scheduler_loop():
    logger.info("Scheduler started.")
    while True:
        try:
            tasks = db.get_pending_tasks()
            for task in tasks:
                logger.info(f"Executing scheduled task {task['id']}: {task['task_type']} for {task['profile_id']}")
                
                pid = task['profile_id']
                
                # Check if already running
                if pid in active_workers and active_workers[pid].is_alive():
                     logger.warning(f"Skipping task {task['id']} - Profile {pid} is busy.")
                     continue

                def task_wrapper(p, t_type, t_id):
                    try:
                        if t_type == 'growth':
                            ThreadsGrowthWorker(p).start()
                        elif t_type == 'comment':
                            ThreadsCommentWorker(p).start()
                    finally:
                        if p in active_workers:
                            del active_workers[p]
                        # Mark as completed (or failed inside worker, but here we update generic status)
                        # Actually worker logs to engagement_log, here we just mark schedule as done
                        db.update_task_status(t_id, 'completed')

                t = threading.Thread(target=task_wrapper, args=(pid, task['task_type'], task['id']))
                active_workers[pid] = t
                t.start()
                
                # Update status to running immediately
                db.update_task_status(task['id'], 'running')
                
            time.sleep(60) # Check every minute
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
            time.sleep(60)

# Start Scheduler Thread
threading.Thread(target=scheduler_loop, daemon=True).start()

def get_config_path(filename):
    return os.path.join(BASE_DIR, filename)

def read_config(filename: str) -> Dict[str, Any]:
    """
    Reads a python config file and extracts the dictionary.
    Assumes the file contains a dictionary variable (e.g. GROWTH_SETTINGS).
    """
    path = get_config_path(filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse AST to find the assignment
    tree = ast.parse(content)
    for node in tree.body:
        if isinstance(node, ast.Assign):
            # Check if we found the settings dict
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id in ['GROWTH_SETTINGS', 'COMMENT_SETTINGS', 'TARGETS']:
                    # Safe eval of the dictionary/list
                    return ast.literal_eval(node.value)
    return {}

def read_config_raw(filename: str) -> str:
    path = get_config_path(filename)
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_config_raw(filename: str, content: str):
    path = get_config_path(filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

class ScheduleRequest(BaseModel):
    profile_ids: List[str]
    task_type: str
    count: int
    start_hour: int
    end_hour: int

@app.post("/api/schedule")
async def create_schedule(req: ScheduleRequest):
    scheduled_count = 0
    now = datetime.now()
    
    for pid in req.profile_ids:
        for _ in range(req.count):
            # Generate random time
            random_hour = random.randint(req.start_hour, req.end_hour)
            random_minute = random.randint(0, 59)
            
            sched_time = now.replace(hour=random_hour, minute=random_minute, second=0, microsecond=0)
            
            # If time passed, schedule for tomorrow
            if sched_time < now:
                sched_time += timedelta(days=1)
                
            db.add_scheduled_task(pid, req.task_type, sched_time)
            scheduled_count += 1
            
    return {"status": "success", "message": f"Scheduled {scheduled_count} tasks."}

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Render the main control panel"""
    # Fetch recent sessions
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions ORDER BY started_at DESC LIMIT 10")
    sessions = cursor.fetchall()
    conn.close()
    
    # Fetch Profiles
    profile_names = profile_manager.list_profile_names()
    profiles = [{"id": profile_manager.get_profile_id_by_name(name), "name": name} for name in profile_names]
    
    # Read Configs for display (Raw text for editing)
    growth_config_text = read_config_raw('growth_config.py')
    comment_config_text = read_config_raw('comment_config.py')

    return templates.TemplateResponse("index.html", {
        "request": request,
        "sessions": sessions,
        "profiles": profiles,
        "growth_config": growth_config_text,
        "comment_config": comment_config_text
    })

@app.post("/api/run_growth")
async def run_growth(
    background_tasks: BackgroundTasks,
    profile_id: str = Form(...)
):
    if profile_id in active_workers and active_workers[profile_id].is_alive():
        return JSONResponse({"status": "error", "message": "Worker already running for this profile"})

    def worker_wrapper(pid):
        try:
            worker = ThreadsGrowthWorker(pid)
            worker.start()
        except Exception as e:
            logger.error(f"Growth worker failed: {e}")
        finally:
            if pid in active_workers:
                del active_workers[pid]

    t = threading.Thread(target=worker_wrapper, args=(profile_id,))
    active_workers[profile_id] = t
    t.start()
    
    return {"status": "success", "message": f"Started Growth Worker for {profile_id}"}

@app.post("/api/run_comment")
async def run_comment(
    background_tasks: BackgroundTasks,
    profile_id: str = Form(...)
):
    if profile_id in active_workers and active_workers[profile_id].is_alive():
        return JSONResponse({"status": "error", "message": "Worker already running for this profile"})

    def worker_wrapper(pid):
        try:
            worker = ThreadsCommentWorker(pid)
            worker.start()
        except Exception as e:
            logger.error(f"Comment worker failed: {e}")
        finally:
            if pid in active_workers:
                del active_workers[pid]

    t = threading.Thread(target=worker_wrapper, args=(profile_id,))
    active_workers[profile_id] = t
    t.start()
    
    return {"status": "success", "message": f"Started Comment Worker for {profile_id}"}

@app.post("/api/save_config")
async def save_config(
    filename: str = Form(...),
    content: str = Form(...)
):
    if filename not in ['growth_config.py', 'comment_config.py']:
        raise HTTPException(status_code=400, detail="Invalid config file")
    
    try:
        # Validate syntax
        ast.parse(content)
        write_config_raw(filename, content)
        return {"status": "success", "message": f"Saved {filename}"}
    except SyntaxError as e:
        return JSONResponse({"status": "error", "message": f"Syntax Error: {e}"}, status_code=400)

@app.get("/api/logs")
async def get_logs():
    """Get recent logs for live stream"""
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, profile_id, action_type, target_username, status, created_at, metadata 
        FROM engagement_log 
        ORDER BY created_at DESC LIMIT 50
    """)
    logs = cursor.fetchall()
    conn.close()
    
    # Format for JSON
    log_data = []
    for log in logs:
        # Try to find profile name
        profile_name = log[1] # Default to ID
        # In a real app we'd map ID to Name efficiently
        
        log_data.append({
            "time": log[5],
            "profile": profile_name,
            "action": f"{log[2]} -> {log[3] or 'feed'}",
            "status": log[4],
            "metadata": log[6]
        })
    return log_data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

