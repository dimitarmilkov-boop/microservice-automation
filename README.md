# Automation Platform - Microservices

Modern Python microservices platform for browser automation and API integrations.

## 🏗️ Architecture

This is a **monorepo** containing multiple independent microservices:

- **services/x-auth-service**: X (Twitter) OAuth automation using GoLogin and Selenium
- **services/service-2**: (Coming soon)
- **services/service-3**: (Coming soon)

Each service is independent, has its own FastAPI app, and can be deployed separately.

## 📁 Repository Structure

```
automation-platform/
├── services/
│   ├── x-auth-service/      # Service #1: X Authorization Automation
│   ├── service-2/           # Future service
│   └── service-3/           # Future service
├── shared/                  # Shared utilities across all services
├── infrastructure/          # Docker, K8s configs
├── .env.example            # Template for environment variables
└── README.md               # This file
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

### 3. Test the API

```bash
# Health check
curl http://localhost:8001/api/v1/health

# Start X OAuth automation (mock)
curl -X POST http://localhost:8001/api/v1/auth/x-oauth \
  -H "Content-Type: application/json" \
  -d '{"profile_id": "test123", "username": "user@example.com"}'

# Check job status
curl http://localhost:8001/api/v1/jobs/{job_id}
```

### 4. Access API Documentation

Open your browser: http://localhost:8001/docs

FastAPI automatically generates interactive API documentation (Swagger UI).

## 🔧 Development Workflow

### Running Services Locally

Each service runs on a different port:

- **x-auth-service**: http://localhost:8001
- **service-2**: http://localhost:8002 (when created)
- **service-3**: http://localhost:8003 (when created)

### Using Docker Compose (Optional)

```bash
cd infrastructure/docker
docker-compose up -d
```

This starts:

- PostgreSQL (port 5432)
- Redis (port 6379)

## 📦 Adding a New Service

1. Copy the template:

```bash
cp -r services/x-auth-service services/new-service-name
```

2. Update service-specific files:

- `app/main.py` - Change service name and description
- `app/config.py` - Update settings
- `requirements.txt` - Add service-specific dependencies
- `README.md` - Document the service

3. Run on a different port:

```bash
uvicorn app.main:app --reload --port 8002
```

## 🧪 Testing

```bash
# From service directory
pytest tests/

# With coverage
pytest --cov=app tests/
```

## 📚 Documentation

- **X Auth Service**: [services/x-auth-service/README.md](services/x-auth-service/README.md)
- **Shared Utilities**: [shared/README.md](shared/README.md)
- **Architecture Decisions**: [MICROSERVICE_ARCHITECTURE_DECISIONS.md](MICROSERVICE_ARCHITECTURE_DECISIONS.md)

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (optional: SQLite for development)
- **Cache**: Redis (optional)
- **Browser Automation**: Selenium + GoLogin
- **Containerization**: Docker

## 📝 Environment Variables

See `.env.example` for all required environment variables.

Key variables:

- `GOLOGIN_TOKEN` - Your GoLogin API token
- `DATABASE_URL` - PostgreSQL connection string (optional)
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARNING, ERROR)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions, please open a GitHub issue.
