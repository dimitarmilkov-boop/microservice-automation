# Automation Modules

This directory contains browser automation code for GoLogin, Selenium, and Cloudflare handling.

## 📁 Expected Files

Move your existing automation scripts here:

```
automation/
├── gologin_session_monitor.py       # GoLogin session management
├── browser_startup_handler.py       # Browser startup and initialization
├── cloudflare_handler.py            # Cloudflare challenge solving
├── fix_db_connections.py            # Database utilities (if needed)
└── [other automation modules]
```

## 🔧 How to Add Your Scripts

### Step 1: Move Files

```bash
# From the project root
cp gologin_session_monitor.py services/x-auth-service/app/automation/
cp browser_startup_handler.py services/x-auth-service/app/automation/
cp cloudflare_handler.py services/x-auth-service/app/automation/
```

### Step 2: Fix Imports

Your existing scripts may have imports like:

```python
from gologin_manager_enhanced import EnhancedGoLoginManager
```

Update them to:

```python
from app.automation.gologin_manager_enhanced import EnhancedGoLoginManager
```

Or use relative imports:

```python
from .gologin_manager_enhanced import EnhancedGoLoginManager
```

### Step 3: Update Workers

In `app/workers/x_oauth_worker.py`, uncomment and update:

```python
from app.automation.gologin_session_monitor import GoLoginSessionMonitor
from app.automation.browser_startup_handler import BrowserStartupHandler
from app.automation.cloudflare_handler import CloudflareHandler

# Then use them in the worker function
monitor = GoLoginSessionMonitor()
session = monitor.start_session(profile_id)
```

### Step 4: Test

```bash
# Run the service
uvicorn app.main:app --reload --port 8001

# Test the endpoint
curl -X POST http://localhost:8001/api/v1/auth/x-oauth \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "your_profile_id", "username": "user@example.com"}'
```

## 📝 Notes

- Keep automation logic separate from API logic
- Use logging for all automation steps
- Handle errors gracefully
- Clean up browser sessions after use
