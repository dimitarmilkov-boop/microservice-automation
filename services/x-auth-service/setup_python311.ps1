# Setup Script for Python 3.11 Environment
# This script helps set up the service with the correct Python version

Write-Host "Python 3.11 Setup Script" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check if Python 3.11 is installed
Write-Host "Checking for Python 3.11..." -ForegroundColor Yellow
try {
    $python311Version = py -3.11 --version 2>&1
    if ($python311Version -match "Python 3\.11") {
        Write-Host "Found: $python311Version" -ForegroundColor Green
        $hasPython311 = $true
    } else {
        $hasPython311 = $false
    }
} catch {
    $hasPython311 = $false
}

if (-not $hasPython311) {
    Write-Host ""
    Write-Host "Python 3.11 NOT FOUND!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python 3.11 first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "2. Install Python 3.11.9 (latest 3.11.x)" -ForegroundColor White
    Write-Host "3. Make sure to check 'Add Python to PATH'" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use winget:" -ForegroundColor Yellow
    Write-Host "  winget install Python.Python.3.11" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Removing old virtual environment if exists..." -ForegroundColor Yellow
Remove-Item -Recurse -Force venv -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Creating new virtual environment with Python 3.11..." -ForegroundColor Yellow
py -3.11 -m venv venv

Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host ""
Write-Host "Verifying Python version in venv..." -ForegroundColor Yellow
$venvPython = python --version
Write-Host "  $venvPython" -ForegroundColor Green

Write-Host ""
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "  (This may take a few minutes...)" -ForegroundColor Gray
pip install -r requirements.txt --quiet

Write-Host ""
Write-Host "Checking for .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item "..\..\env.template" ".env"
    Write-Host ".env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Edit .env and add your GOLOGIN_TOKEN" -ForegroundColor Cyan
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the service:" -ForegroundColor Cyan
Write-Host "  uvicorn app.main:app --reload --port 8001" -ForegroundColor White
Write-Host ""
Write-Host "Then visit:" -ForegroundColor Cyan
Write-Host "  http://localhost:8001/docs" -ForegroundColor White
Write-Host ""
