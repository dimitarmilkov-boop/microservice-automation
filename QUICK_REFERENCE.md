# Quick Reference - Common Commands

Fast reference for common tasks. Bookmark this page!

---

## 🚀 Start/Stop Service

```bash
# Navigate to service
cd services/x-auth-service

# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Start service (dev mode)
uvicorn app.main:app --reload --port 8001

# Start service (production mode)
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4

# Stop service
Ctrl+C
```

---

## 🧪 Test Endpoints

```bash
# Health check
curl http://localhost:8001/api/v1/health

# Create OAuth job
curl -X POST http://localhost:8001/api/v1/auth/x-oauth \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "YOUR_ID", "username": "user@email.com", "authorization_url": "https://aiott.com/oauth"}'

# Check job status
curl http://localhost:8001/api/v1/jobs/{job_id}

# Cancel job
curl -X DELETE http://localhost:8001/api/v1/jobs/{job_id}

# API docs in browser
open http://localhost:8001/docs
```

---

## 📦 Dependencies

```bash
# Install all dependencies
pip install -r requirements.txt

# Add new dependency
pip install package-name
pip freeze > requirements.txt

# Update dependencies
pip install --upgrade -r requirements.txt
```

---

## 🗄️ Database (when added)

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## 🐳 Docker

```bash
# Start dependencies (Postgres, Redis)
cd infrastructure/docker
docker-compose up -d

# Stop dependencies
docker-compose down

# View logs
docker-compose logs -f

# Build service image
cd services/x-auth-service
docker build -t x-auth-service:latest .

# Run service container
docker run -p 8001:8001 --env-file .env x-auth-service:latest
```

---

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api.py

# Run specific test
pytest tests/test_api.py::test_health_endpoint

# Watch mode (run tests on file change)
pytest-watch
```

---

## 📝 Logs

```bash
# View logs (if service running)
# Logs print to stdout by default

# Save logs to file
uvicorn app.main:app --reload --port 8001 > service.log 2>&1

# Filter JSON logs
tail -f service.log | grep "x-auth-service"

# Pretty print JSON logs
tail -f service.log | python -m json.tool
```

---

## 🔍 Debugging

```bash
# Run with debug mode
DEBUG=true uvicorn app.main:app --reload --port 8001

# Check environment variables
env | grep GOLOGIN

# Test GoLogin token
curl -H "Authorization: Bearer $GOLOGIN_TOKEN" https://api.gologin.com/browser

# Python interactive shell
python
>>> from app.config import settings
>>> print(settings.gologin_token)
```

---

## 📊 Monitoring (when Prometheus added)

```bash
# View metrics
curl http://localhost:8001/metrics

# Access Prometheus
open http://localhost:9090

# Access Grafana
open http://localhost:3000
# Login: admin / admin
```

---

## 🔧 Common Fixes

```bash
# Port already in use
lsof -i :8001  # Find process
kill -9 PID    # Kill it
# Or use different port: --port 8002

# Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

# Reset virtual environment
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Fix imports
export PYTHONPATH="${PYTHONPATH}:${PWD}/../.."
```

---

## 📁 File Locations

| File           | Path                                                   |
| -------------- | ------------------------------------------------------ |
| Main app       | `services/x-auth-service/app/main.py`                  |
| Config         | `services/x-auth-service/app/config.py`                |
| Models         | `services/x-auth-service/app/models.py`                |
| Auth endpoints | `services/x-auth-service/app/api/v1/endpoints/auth.py` |
| Workers        | `services/x-auth-service/app/workers/`                 |
| Automation     | `services/x-auth-service/app/automation/`              |
| Tests          | `services/x-auth-service/tests/`                       |
| Environment    | `services/x-auth-service/.env`                         |
| Requirements   | `services/x-auth-service/requirements.txt`             |

---

## 🌐 URLs (when service running)

| Resource             | URL                                 |
| -------------------- | ----------------------------------- |
| Service root         | http://localhost:8001               |
| API docs (Swagger)   | http://localhost:8001/docs          |
| API docs (ReDoc)     | http://localhost:8001/redoc         |
| OpenAPI spec         | http://localhost:8001/openapi.json  |
| Health check         | http://localhost:8001/api/v1/health |
| Metrics (if enabled) | http://localhost:8001/metrics       |

---

## 🆕 Add New Service

```bash
# Copy template
cp -r services/x-auth-service services/new-service

# Update files
cd services/new-service
# Edit app/config.py - change service_name and port
# Edit app/main.py - change title and description
# Edit requirements.txt - add service-specific deps

# Run on different port
uvicorn app.main:app --reload --port 8002
```

---

## 🔑 Environment Variables

```bash
# Required
export GOLOGIN_TOKEN=your_token

# Optional
export LOG_LEVEL=DEBUG
export LOG_FORMAT=json
export DATABASE_URL=postgresql://user:pass@localhost/db
export REDIS_URL=redis://localhost:6379

# Or use .env file
cp env.template .env
# Edit .env with your values
```

---

## 💡 Quick Tips

```bash
# Auto-format code
black app/

# Lint code
ruff check app/

# Type check
mypy app/

# Count lines of code
find app/ -name "*.py" | xargs wc -l

# Find TODOs
grep -r "TODO" app/

# List all endpoints
uvicorn app.main:app --reload &
sleep 2
curl http://localhost:8001/openapi.json | python -m json.tool | grep \"path\"
```

---

## 📱 Quick API Test (Python)

```python
import requests

# Health check
r = requests.get("http://localhost:8001/api/v1/health")
print(r.json())

# Create job
r = requests.post(
    "http://localhost:8001/api/v1/auth/x-oauth",
    json={
        "profile_id": "test123",
        "username": "user@email.com",
        "authorization_url": "https://aiott.com/oauth"
    }
)
job_id = r.json()["job_id"]

# Check status
r = requests.get(f"http://localhost:8001/api/v1/jobs/{job_id}")
print(r.json())
```

---

## 🎯 Checklist for New Developer

- [ ] Clone repository
- [ ] Create virtual environment
- [ ] Install dependencies
- [ ] Copy env.template to .env
- [ ] Add GOLOGIN_TOKEN
- [ ] Run service
- [ ] Visit /docs
- [ ] Run tests
- [ ] Read GETTING_STARTED.md

---

**Last Updated**: September 30, 2025  
**Service**: X Auth Service v0.1.0
