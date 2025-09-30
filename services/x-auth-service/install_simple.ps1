# Installation Script for X Auth Service
Write-Host "X Auth Service - Installation Script"
Write-Host "======================================"
Write-Host ""

# Check Python
Write-Host "Checking Python installation..."
$pythonVersion = python --version 2>&1
Write-Host "Found: $pythonVersion"
Write-Host ""

# Create venv
Write-Host "Creating virtual environment..."
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "Virtual environment created"
} else {
    Write-Host "Virtual environment already exists"
}
Write-Host ""

# Activate venv
Write-Host "Activating virtual environment..."
& .\venv\Scripts\Activate.ps1
Write-Host ""

# Upgrade pip
Write-Host "Upgrading pip..."
python -m pip install --upgrade pip
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..."
pip install -r requirements.txt
Write-Host ""

# Check .env
Write-Host "Checking environment file..."
if (-not (Test-Path ".env")) {
    Copy-Item "..\..\env.template" ".env"
    Write-Host ".env file created from template"
    Write-Host "IMPORTANT: Edit .env and add your GOLOGIN_TOKEN"
} else {
    Write-Host ".env file already exists"
}
Write-Host ""

Write-Host "Installation Complete!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Edit .env and add your GOLOGIN_TOKEN"
Write-Host "2. Run: uvicorn app.main:app --reload --port 8001"
Write-Host "3. Visit: http://localhost:8001/docs"
Write-Host ""
