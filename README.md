# Automation Platform - Microservices

Modern Python microservices platform for browser automation and API integrations.

## 🏗️ Architecture

This is a **monorepo** containing multiple independent microservices designed for scalability and isolation:

- **services/x-auth-service**: X (Twitter) OAuth automation service using GoLogin and Selenium (FastAPI). Handles authentication flows and account management.
- **services/ig-engagement-service**: Instagram engagement automation worker. Runs as a background CLI tool for scheduling and executing engagement strategies (liking comments) using GoLogin profiles.
- **shared/**: Common library for logging, database connections, browser automation wrappers (Selenium/GoLogin), and exception handling.
- **scripts/**: Utility scripts for maintenance and verification (e.g., checking GoLogin profiles).
- **threads/**: Research and extraction workspace for Threads automation (Chrome extensions, code extraction guides).

Each service is independent, has its own configuration, and can be deployed separately while sharing core utilities.

## 📁 Repository Structure

```
automation-platform/
├── services/
│   ├── x-auth-service/        # Service #1: X (Twitter) OAuth API
│   │   ├── app/               # FastAPI application code
│   │   │   ├── api/           # API Endpoints (Auth, Jobs, Health)
│   │   │   ├── workers/       # Background task workers (OAuth, Account Setup)
│   │   │   └── automation/    # Browser automation modules
│   │   ├── Dockerfile         # Service-specific Docker build
│   │   └── requirements.txt   # Service dependencies
│   └── ig-engagement-service/ # Service #2: Instagram Engagement Worker
│       ├── automation/        # Instagram-specific logic
│       ├── ig_liker.py        # CLI entry point & Scheduler
│       └── requirements.txt   # Service dependencies
├── shared/                    # Shared library (imported by services)
│   ├── browser_automation/    # GoLogin & Selenium wrappers
│   │   ├── gologin_manager.py # GoLogin API integration
│   │   └── selenium_base.py   # Base Selenium driver handling
│   ├── logging_config.py      # Standardized JSON logging
│   └── db_connections.py      # Database connection pooling
├── scripts/                   # Global utility scripts
│   └── check_gologin_profiles.py # Tool to verify GoLogin account status
├── infrastructure/            # Docker, K8s configs
│   └── docker/
│       └── docker-compose.yml # Local dev environment (DB, Redis)
├── threads/                   # Threads Automation Research
│   ├── THREADS_CODE_EXTRACTION_GUIDE.md # Guide for extracting logic from extensions
│   └── ...                    # Chrome extensions & research notes
├── .env.example               # Template for environment variables
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (optional, for databases)
- GoLogin account and API token

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd automation-platform

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 2. Run X Auth Service

The X Auth Service provides a REST API for handling Twitter OAuth flows.

```bash
# Navigate to service
cd services/x-auth-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn app.main:app --reload --port 8001
```

**Test the API:**

```bash
# Health check
curl http://localhost:8001/api/v1/health
```

### 3. Run IG Engagement Service

The Instagram Engagement Service runs as a standalone worker/CLI tool.

```bash
# Navigate to service root (or run from project root with path)
# Ensure you have targets in ig_targets.txt
python services/ig-engagement-service/ig_liker.py
```

### 4. Utilities

Check your GoLogin profiles:

```bash
python scripts/check_gologin_profiles.py
```

### 5. Access API Documentation

For the X Auth Service:

- **Swagger UI:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc

## 🔧 Development Workflow

### Service Isolation

Each service runs in its own environment.

- **x-auth-service**: `http://localhost:8001` (FastAPI API)
- **ig-engagement-service**: Background worker / CLI script

### Shared Code

Code in `shared/` is available to all services. When developing:

1. Modify `shared/` code.
2. Restart services to pick up changes (unless using editable installs).
3. This ensures consistent logging, DB access, and browser logic across the platform.

### Infrastructure (Docker Compose)

Use Docker Compose to spin up supporting infrastructure (PostgreSQL, Redis) without running the services in containers during development.

```bash
cd infrastructure/docker
docker-compose up -d
```

This starts:

- **PostgreSQL** (port 5432)
- **Redis** (port 6379)

## 📦 Adding a New Service

1. **Copy Template:**
   ```bash
   cp -r services/x-auth-service services/new-service-name
   ```
2. **Update Config:**
   - `app/main.py`: Change service name/description.
   - `requirements.txt`: Add dependencies.
   - `README.md`: Document specific features.
3. **Run:**
   ```bash
   uvicorn app.main:app --reload --port 8002
   ```

## 🧪 Testing

Run tests per service to ensure isolation.

```bash
# From service directory (e.g., services/x-auth-service)
pytest tests/

# With coverage
pytest --cov=app tests/
```

## 📚 Documentation

- **X Auth Service**: [services/x-auth-service/README.md](services/x-auth-service/README.md)
- **IG Engagement Service**: [services/ig-engagement-service/README.md](services/ig-engagement-service/README.md)
- **Shared Utilities**: [shared/README.md](shared/README.md)
- **Threads Research**: [threads/THREADS_CODE_EXTRACTION_GUIDE.md](threads/THREADS_CODE_EXTRACTION_GUIDE.md)
- **Architecture Decisions**: [MICROSERVICE_ARCHITECTURE_DECISIONS.md](MICROSERVICE_ARCHITECTURE_DECISIONS.md)

## 🛠️ Tech Stack

- **Framework**: FastAPI (Service #1), Python Scripts (Service #2)
- **Database**: PostgreSQL (Production), SQLite (Dev/Local)
- **Browser Automation**: Selenium + GoLogin (via `shared` lib)
- **Containerization**: Docker
- **Logging**: Structlog (JSON format)

## 📝 Environment Variables

See `.env.example` for all required environment variables.

Key variables:

- `GOLOGIN_TOKEN` - Your GoLogin API token
- `DATABASE_URL` - PostgreSQL connection string (optional)
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARNING, ERROR)
- `IG_PROFILES` - Comma-separated list of GoLogin profiles for IG
- `IG_DAILY_LIKE_LIMIT` - Safety limit for IG actions

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions, please open a GitHub issue.
