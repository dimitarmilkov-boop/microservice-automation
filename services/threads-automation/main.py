from fastapi import FastAPI, Request, BackgroundTasks, Form
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn
import logging
import os
import threading
from typing import List

from .threads_worker import ThreadsWorker
from .config import Config
from .database import Database

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

# Global State (for simple MVP status tracking)
active_workers = {}

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Render the main control panel"""
    # Fetch recent sessions
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions ORDER BY started_at DESC LIMIT 5")
    sessions = cursor.fetchall()
    conn.close()
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "sessions": sessions,
        "settings": Config.DEFAULT_SETTINGS
    })

@app.post("/start")
async def start_automation(
    background_tasks: BackgroundTasks,
    profile_id: str = Form(...),
    action_type: str = Form("all") # 'all', 'follow', 'comment'
):
    """Start automation for a specific profile"""
    if profile_id in active_workers and active_workers[profile_id].is_alive():
        return JSONResponse({"status": "error", "message": "Worker already running for this profile"})

    def worker_wrapper(pid):
        worker = ThreadsWorker(pid)
        worker.start()
        del active_workers[pid]

    # Run in background thread (simple implementation)
    # In production, use Celery or a robust queue
    t = threading.Thread(target=worker_wrapper, args=(profile_id,))
    active_workers[profile_id] = t
    t.start()
    
    return {"status": "success", "message": f"Started automation for {profile_id}"}

@app.get("/api/logs")
async def get_logs():
    """Get recent logs for live stream"""
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, profile_id, action_type, target_username, status, created_at 
        FROM engagement_log 
        ORDER BY created_at DESC LIMIT 20
    """)
    logs = cursor.fetchall()
    conn.close()
    
    # Format for JSON
    log_data = []
    for log in logs:
        log_data.append({
            "time": log[5],
            "profile": log[1],
            "action": f"{log[2]} -> {log[3]}",
            "status": log[4]
        })
    return log_data

if __name__ == "__main__":
    uvicorn.run(app, host=Config.HOST, port=Config.PORT)








