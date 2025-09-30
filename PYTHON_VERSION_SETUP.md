# Python Version Setup Guide

## ⚠️ Issue: Python 3.13 Compatibility

Python 3.13.5 is too new and many libraries don't have pre-built wheels yet, causing installation failures.

**Recommended Version: Python 3.11.x** (Best compatibility with all dependencies)

---

## 🔧 Windows Installation Steps

### Option 1: Install Python 3.11 from python.org (Recommended)

1. **Download Python 3.11**

   - Visit: https://www.python.org/downloads/
   - Download: **Python 3.11.9** (latest 3.11.x version)
   - Choose: Windows installer (64-bit)

2. **Install Python 3.11**

   - ✅ Check "Add Python 3.11 to PATH"
   - ✅ Check "Install for all users" (optional)
   - Click "Install Now"

3. **Verify Installation**

   ```powershell
   py -3.11 --version
   # Should show: Python 3.11.9
   ```

4. **Create Virtual Environment with Python 3.11**

   ```powershell
   cd C:\Users\Dimitar\Desktop\automation_service\services\x-auth-service

   # Use py launcher to specify Python 3.11
   py -3.11 -m venv venv

   # Activate virtual environment
   .\venv\Scripts\Activate.ps1

   # Verify Python version in venv
   python --version
   # Should show: Python 3.11.9
   ```

5. **Install Dependencies**
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

---

### Option 2: Use Windows Package Manager (winget)

```powershell
# Install Python 3.11 via winget
winget install Python.Python.3.11

# Verify
py -3.11 --version

# Create venv
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

### Option 3: Use Chocolatey

```powershell
# Install Chocolatey (if not installed)
# See: https://chocolatey.org/install

# Install Python 3.11
choco install python311

# Verify
py -3.11 --version

# Create venv
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## 🚀 Quick Start After Installing Python 3.11

```powershell
# Navigate to service directory
cd C:\Users\Dimitar\Desktop\automation_service\services\x-auth-service

# Remove old venv if exists
Remove-Item -Recurse -Force venv -ErrorAction SilentlyContinue

# Create new venv with Python 3.11
py -3.11 -m venv venv

# Activate
.\venv\Scripts\Activate.ps1

# Verify Python version
python --version  # Should show 3.11.x

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Copy environment template
Copy-Item ..\..\env.template .env

# Edit .env and add GOLOGIN_TOKEN
notepad .env

# Run the service
python -m uvicorn app.main:app --reload --port 8001
```

---

## 🔍 Verify Everything Works

```powershell
# Check Python version
python --version

# Check installed packages
pip list

# Test import of key packages
python -c "import fastapi; print('FastAPI:', fastapi.__version__)"
python -c "import selenium; print('Selenium:', selenium.__version__)"
python -c "from gologin import GoLogin; print('GoLogin: OK')"
python -c "import pydantic; print('Pydantic:', pydantic.__version__)"
```

---

## 📝 Why Python 3.11?

| Version         | Status                   | Recommendation              |
| --------------- | ------------------------ | --------------------------- |
| Python 3.13     | ❌ Too new (Oct 2024)    | Many libraries lack support |
| Python 3.12     | ⚠️ Newer (Oct 2023)      | Some compatibility issues   |
| **Python 3.11** | ✅ **Stable (Oct 2022)** | **Best compatibility**      |
| Python 3.10     | ✅ Stable but older      | OK but older                |
| Python 3.9      | ⚠️ Getting old           | Not recommended             |

**Python 3.11 Benefits:**

- ✅ All our dependencies have pre-built wheels
- ✅ Proven stability (2+ years in production)
- ✅ Excellent performance (faster than 3.10)
- ✅ Full FastAPI, Selenium, Pydantic support
- ✅ Active security updates until 2027

---

## 🐛 Troubleshooting

### Issue: `py -3.11` not found

**Solution:** Python 3.11 not installed. Install from python.org first.

### Issue: venv uses wrong Python version

```powershell
# Check which Python is being used
Get-Command python | Select-Object Source

# Force use Python 3.11 launcher
py -3.11 -m venv venv --clear
```

### Issue: Permission error when creating venv

```powershell
# Run PowerShell as Administrator, or:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Packages fail to install

```powershell
# Upgrade pip first
python -m pip install --upgrade pip setuptools wheel

# Install with verbose output
pip install -r requirements.txt -v
```

---

## 🎯 Next Steps After Setup

1. ✅ Python 3.11 installed
2. ✅ Virtual environment created
3. ✅ Dependencies installed
4. ✅ .env configured with GOLOGIN_TOKEN
5. 🚀 **Ready to run the service!**

```powershell
# Run the service
uvicorn app.main:app --reload --port 8001

# Visit API docs
# http://localhost:8001/docs

# Test endpoint
curl -X POST http://localhost:8001/api/v1/health
```

---

**Current Python Version Check:**

```powershell
python --version  # Should show 3.11.x after setup
```
