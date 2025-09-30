@echo off
echo ========================================
echo X Auth Service Setup (Python 3.11)
echo ========================================
echo.

echo Checking Python 3.11...
py -3.11 --version
if errorlevel 1 (
    echo ERROR: Python 3.11 not found!
    echo Please install from: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo.

echo Creating virtual environment with Python 3.11...
py -3.11 -m venv venv
echo.

echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo Verifying Python version in venv...
python --version
echo.

echo Upgrading pip...
python -m pip install --upgrade pip --quiet
echo.

echo Installing dependencies (this may take a few minutes)...
pip install -r requirements.txt
echo.

echo Checking for .env file...
if not exist .env (
    copy ..\..\env.template .env
    echo .env file created!
    echo.
    echo IMPORTANT: Edit .env and add your GOLOGIN_TOKEN
    echo Run: notepad .env
) else (
    echo .env file already exists
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the service:
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload --port 8001
echo.
echo Then visit: http://localhost:8001/docs
echo.
pause
