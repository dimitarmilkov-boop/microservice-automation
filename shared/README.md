# Shared Utilities

Common code shared across all microservices in the automation platform.

## 📦 Modules

### `logging_config.py`

Structured logging configuration with JSON output.

**Usage:**

```python
from shared.logging_config import setup_logging

logger = setup_logging(
    service_name="x-auth-service",
    log_level="INFO",
    log_format="json"
)

logger.info("Service started")
logger.error("Something went wrong", extra={"user_id": "123"})
```

### `exceptions.py`

Common exception classes for consistent error handling.

**Usage:**

```python
from shared.exceptions import GoLoginException, CloudflareException

raise GoLoginException("Failed to start session", error_code="SESSION_START_FAILED")
raise CloudflareException("Challenge timeout", error_code="CHALLENGE_TIMEOUT")
```

## 🔧 Adding New Shared Utilities

1. Create a new module in `shared/`
2. Import and use in your service:
   ```python
   from shared.your_module import your_function
   ```

## 📝 Guidelines

- Keep shared code **minimal and generic**
- Only add code that is truly used by **multiple services**
- Document all public functions and classes
- Avoid service-specific logic
