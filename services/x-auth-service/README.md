# X Auth Service

Browser automation microservice for X (Twitter) OAuth authorization and account management.

## 🎯 Purpose

This service provides automated browser-based workflows for:

- **X OAuth Authorization**: Automate OAuth flow for X (Twitter) integrations
- **Account Setup**: Automated X account creation and configuration

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- GoLogin API token
- Chrome/Chromium (for Selenium)

### Installation

```bash
# Navigate to service directory
cd services/x-auth-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp ../../env.template .env

# Edit .env with your GoLogin token
nano .env
```

### Running the Service

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --port 8001

# Or using Python
python -m app.main
```

The service will be available at: http://localhost:8001

## 📚 API Documentation

Once the service is running, visit:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc
- **OpenAPI JSON**: http://localhost:8001/openapi.json

## 🔌 API Endpoints

### Health Check

```bash
GET /api/v1/health
```

### X OAuth Authorization

```bash
POST /api/v1/auth/x-oauth
Content-Type: application/json

{
  "profile_id": "686e7a83d44e36ee50584179",
  "username": "user@example.com",
  "authorization_url": "https://aiott.com/oauth"
}
```

Response:

```json
{
  "job_id": "job_abc123",
  "status": "pending",
  "created_at": "2025-09-30T10:00:00Z",
  "message": "X OAuth automation job created"
}
```

### Account Setup

```bash
POST /api/v1/auth/account-setup
Content-Type: application/json

{
  "profile_id": "686e7a83d44e36ee50584179",
  "username": "newuser",
  "password": "SecurePass123!",
  "email": "user@example.com"
}
```

### Check Job Status

```bash
GET /api/v1/jobs/{job_id}
```

Response:

```json
{
  "job_id": "job_abc123",
  "status": "completed",
  "progress": 100,
  "created_at": "2025-09-30T10:00:00Z",
  "completed_at": "2025-09-30T10:05:00Z",
  "result": {
    "success": true,
    "oauth_completed": true
  }
}
```

### Cancel Job

```bash
DELETE /api/v1/jobs/{job_id}
```

## 🏗️ Project Structure

```
x-auth-service/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── models.py            # Pydantic models
│   ├── api/
│   │   └── v1/
│   │       ├── router.py    # API router
│   │       └── endpoints/   # API endpoints
│   ├── workers/
│   │   ├── x_oauth_worker.py      # OAuth automation worker
│   │   └── account_setup_worker.py # Account setup worker
│   └── automation/          # Browser automation modules
│       ├── gologin_session_monitor.py
│       ├── browser_startup_handler.py
│       └── cloudflare_handler.py
├── tests/
├── requirements.txt
└── README.md
```

## 🔧 Configuration

Environment variables (set in `.env`):

| Variable              | Description                                 | Required             |
| --------------------- | ------------------------------------------- | -------------------- |
| `GOLOGIN_TOKEN`       | GoLogin API token                           | Yes                  |
| `LOG_LEVEL`           | Logging level (DEBUG, INFO, WARNING, ERROR) | No (default: INFO)   |
| `LOG_FORMAT`          | Log format (json, text)                     | No (default: json)   |
| `DATABASE_URL`        | Database connection string                  | No (default: SQLite) |
| `ANTICAPTCHA_API_KEY` | AntiCaptcha service key                     | No                   |
| `TWOCAPTCHA_API_KEY`  | 2Captcha service key                        | No                   |

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api.py
```

## 🐛 Debugging

Enable debug mode in `.env`:

```
DEBUG=true
LOG_LEVEL=DEBUG
```

View logs:

```bash
# Logs are written to stdout in JSON format
# Filter by service name
tail -f logs/app.log | grep "x-auth-service"
```

## 📝 Adding Automation Logic

The workers currently have placeholder code with `TODO` comments. To add your automation:

1. Move your existing automation scripts to `app/automation/`:

   ```bash
   cp /path/to/gologin_*.py app/automation/
   ```

2. Update imports in workers:

   ```python
   from app.automation.gologin_session_monitor import GoLoginSessionMonitor
   ```

3. Uncomment and complete the `TODO` sections in:

   - `app/workers/x_oauth_worker.py`
   - `app/workers/account_setup_worker.py`

4. Wire up the workers in `app/api/v1/endpoints/auth.py`:
   ```python
   background_tasks.add_task(run_x_oauth_automation, job_id, request, jobs_store)
   ```

## 🚢 Deployment

### Docker

```bash
# Build image
docker build -t x-auth-service:latest .

# Run container
docker run -p 8001:8001 --env-file .env x-auth-service:latest
```

### Production Settings

- Set `DEBUG=false`
- Use PostgreSQL instead of SQLite
- Configure proper logging aggregation
- Set up monitoring and alerts

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update API documentation
4. Use type hints for all functions
5. Run `black` and `ruff` before committing

## 📄 License

[Your License Here]
