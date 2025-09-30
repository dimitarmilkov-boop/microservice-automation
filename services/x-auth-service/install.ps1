# Installation Script for X Auth Service (Windows PowerShell)
# This script sets up the development environment

Write-Host "🚀 X Auth Service - Installation Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "📦 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11+ first." -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host ""
Write-Host "🔨 Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⚠️  Virtual environment already exists. Skipping creation." -ForegroundColor Yellow
} else {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "🔌 Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host ""
Write-Host "📦 Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies from requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check if .env exists
Write-Host ""
Write-Host "🔑 Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "..\..\env.template" ".env"
    Write-Host "📝 Please edit .env and add your GOLOGIN_TOKEN" -ForegroundColor Cyan
}

# Summary
Write-Host ""
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env and add your GOLOGIN_TOKEN" -ForegroundColor White
Write-Host "  2. Run: uvicorn app.main:app --reload --port 8001" -ForegroundColor White
Write-Host "  3. Visit: http://localhost:8001/docs" -ForegroundColor White
Write-Host ""
Write-Host "🧪 To test the API:" -ForegroundColor Cyan
Write-Host '  curl -X POST http://localhost:8001/api/v1/auth/x-oauth \' -ForegroundColor White
Write-Host '    -H "Content-Type: application/json" \' -ForegroundColor White
Write-Host '    -d "{\"profile_id\": \"YOUR_PROFILE_ID\", \"username\": \"user@email.com\"}"' -ForegroundColor White
Write-Host ""
