"""
API endpoint tests.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint returns service info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "x-auth-service"
    assert data["status"] == "running"
    assert "version" in data


def test_health_endpoint():
    """Test health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "x-auth-service"


def test_x_oauth_endpoint():
    """Test X OAuth automation endpoint."""
    request_data = {
        "profile_id": "test_profile_123",
        "username": "test@example.com",
        "authorization_url": "https://aiott.com/oauth",
    }

    response = client.post("/api/v1/auth/x-oauth", json=request_data)
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "pending"
    assert "created_at" in data


def test_account_setup_endpoint():
    """Test account setup automation endpoint."""
    request_data = {
        "profile_id": "test_profile_123",
        "username": "testuser",
        "password": "SecurePass123!",
        "email": "test@example.com",
    }

    response = client.post("/api/v1/auth/account-setup", json=request_data)
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "pending"


def test_job_status_endpoint():
    """Test job status retrieval."""
    # First create a job
    request_data = {
        "profile_id": "test_profile_123",
        "username": "test@example.com",
        "authorization_url": "https://aiott.com/oauth",
    }

    create_response = client.post("/api/v1/auth/x-oauth", json=request_data)
    job_id = create_response.json()["job_id"]

    # Then get its status
    status_response = client.get(f"/api/v1/jobs/{job_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    assert data["job_id"] == job_id
    assert "status" in data
    assert "progress" in data


def test_job_not_found():
    """Test job status for non-existent job."""
    response = client.get("/api/v1/jobs/nonexistent_job_id")
    assert response.status_code == 404


def test_invalid_request():
    """Test endpoint with invalid request data."""
    request_data = {
        "profile_id": "test_profile_123",
        # Missing required 'username' field
    }

    response = client.post("/api/v1/auth/x-oauth", json=request_data)
    assert response.status_code == 422  # Validation error
