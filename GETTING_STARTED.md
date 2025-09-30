# Getting Started - Automation Platform

Quick start guide to get the X Auth Service running in 5 minutes.

## 🚀 Step 1: Setup Environment (2 minutes)

```bash
# Navigate to the service
cd services/x-auth-service

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## 🔑 Step 2: Configure Environment Variables (1 minute)

```bash
# Copy environment template
cp ../../env.template .env

# Edit .env file
nano .env  # or use your preferred editor
```

**Required: Add your GoLogin token**

```
GOLOGIN_TOKEN=your_actual_gologin_token_here
```

**Optional: Configure other settings**

```
LOG_LEVEL=INFO
LOG_FORMAT=json
```

## ▶️ Step 3: Run the Service (1 minute)

```bash
# Start the FastAPI service
uvicorn app.main:app --reload --port 8001
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete.
```

## 🧪 Step 4: Test the API (1 minute)

### Option A: Use the Browser

Open http://localhost:8001/docs

You'll see interactive API documentation (Swagger UI).

### Option B: Use cURL

```bash
# Health check
curl http://localhost:8001/api/v1/health

# Create a mock OAuth job
curl -X POST http://localhost:8001/api/v1/auth/x-oauth \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "686e7a83d44e36ee50584179",
    "username": "test@example.com",
    "authorization_url": "https://aiott.com/oauth"
  }'

# Response will include a job_id
{
  "job_id": "job_abc123456",
  "status": "pending",
  "created_at": "2025-09-30T10:00:00Z",
  "message": "X OAuth automation job created. Use /jobs/{job_id} to track status."
}

# Check job status
curl http://localhost:8001/api/v1/jobs/job_abc123456
```

## 🎉 Success!

Your FastAPI service is now running with:

- ✅ Mock endpoints responding
- ✅ Job tracking working
- ✅ API documentation available

---

## 🔧 Next Steps: Add Automation Logic

Currently, the workers return mock responses. To add your actual automation:

### Step 1: Move Your Automation Scripts

```bash
# From project root
cd services/x-auth-service

# Copy your existing automation files
cp /path/to/your/gologin_session_monitor.py app/automation/
cp /path/to/your/browser_startup_handler.py app/automation/
cp /path/to/your/cloudflare_handler.py app/automation/
# ... copy other automation files
```

### Step 2: Fix Imports in Moved Files

Open each moved file and update imports:

**Before:**

```python
from gologin_manager_enhanced import EnhancedGoLoginManager
from fix_db_connections import DBConnection
```

**After:**

```python
from app.automation.gologin_manager_enhanced import EnhancedGoLoginManager
from app.automation.fix_db_connections import DBConnection
```

### Step 3: Wire Up Workers

Edit `app/workers/x_oauth_worker.py`:

**Uncomment these lines:**

```python
from app.automation.gologin_session_monitor import GoLoginSessionMonitor
from app.automation.browser_startup_handler import BrowserStartupHandler
from app.automation.cloudflare_handler import CloudflareHandler
```

**Uncomment the automation steps and add your logic:**

```python
# Step 1 - Start GoLogin session
monitor = GoLoginSessionMonitor()
session_data = monitor.get_session_status_detailed(request.profile_id)
# ... your automation code
```

### Step 4: Enable Background Tasks

Edit `app/api/v1/endpoints/auth.py`:

**Uncomment this line:**

```python
background_tasks.add_task(run_x_oauth_automation, job_id, request, jobs_store)
```

From:

```python
# TODO: Add background task to run automation
# background_tasks.add_task(run_x_oauth_worker, job_id, request)
```

To:

```python
from app.workers.x_oauth_worker import run_x_oauth_automation
background_tasks.add_task(run_x_oauth_automation, job_id, request, jobs_store)
```

### Step 5: Test Real Automation

```bash
# Restart the service
# It will auto-reload if you're using --reload flag

# Trigger a real automation
curl -X POST http://localhost:8001/api/v1/auth/x-oauth \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "YOUR_REAL_GOLOGIN_PROFILE_ID",
    "username": "your_email@example.com",
    "authorization_url": "https://aiott.com/oauth"
  }'

# Watch the logs for automation progress
# The service will now actually:
# 1. Start GoLogin browser
# 2. Navigate to the URL
# 3. Handle Cloudflare challenges
# 4. Complete OAuth flow
```

---

## 🐛 Troubleshooting

### Service won't start

```bash
# Check if port 8001 is already in use
lsof -i :8001  # On Windows: netstat -ano | findstr :8001

# Use a different port
uvicorn app.main:app --reload --port 8002
```

### Import errors

```bash
# Make sure you're in the service directory
cd services/x-auth-service

# Make sure shared modules are accessible
export PYTHONPATH="${PYTHONPATH}:../../"  # On Windows: set PYTHONPATH=%PYTHONPATH%;../../
```

### GoLogin errors

```bash
# Verify your token is correct
echo $GOLOGIN_TOKEN  # On Windows: echo %GOLOGIN_TOKEN%

# Test the token manually
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.gologin.com/browser
```

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8001/docs
- **Service README**: [services/x-auth-service/README.md](services/x-auth-service/README.md)
- **Main README**: [README.md](README.md)
- **Architecture Decisions**: [MICROSERVICE_ARCHITECTURE_DECISIONS.md](MICROSERVICE_ARCHITECTURE_DECISIONS.md)

---

## 🎯 What You Have Now

✅ **Monorepo structure** ready for multiple microservices  
✅ **Shared utilities** for logging and exceptions  
✅ **FastAPI service** with working endpoints  
✅ **Job tracking** system (in-memory for now)  
✅ **API documentation** auto-generated  
✅ **Clear places** to add your automation code  
✅ **Docker support** for dependencies  
✅ **Testing framework** setup

## 🚀 What's Next

1. **Move automation scripts** → Add your browser automation
2. **Test with real profiles** → Verify automation works
3. **Add database** → Replace in-memory job storage with PostgreSQL
4. **Add monitoring** → Set up Prometheus metrics
5. **Build Service #2** → Copy template and customize

**Questions?** Check the READMEs or review the code comments - everything is documented!
