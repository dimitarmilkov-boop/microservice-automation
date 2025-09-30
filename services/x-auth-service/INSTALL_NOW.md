# 🚀 Quick Install Guide

## ⚠️ IMPORTANT: Python Version Issue

Your current Python version is **3.13.5** which is too new and will cause library conflicts.

**You need Python 3.11** for best compatibility.

---

## 📥 Step 1: Install Python 3.11

### Easy Method (Recommended):

**Download and Install:**

1. Go to: https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
2. Run the installer
3. ✅ **CHECK "Add Python 3.11 to PATH"**
4. Click "Install Now"
5. Wait for installation to complete

**Or use Windows Package Manager:**

```powershell
winget install Python.Python.3.11
```

---

## 🔧 Step 2: Set Up Environment

Once Python 3.11 is installed, run this command:

```powershell
# Navigate to service directory (if not already there)
cd C:\Users\Dimitar\Desktop\automation_service\services\x-auth-service

# Run the setup script
.\setup_python311.ps1
```

This script will:

- ✅ Verify Python 3.11 is installed
- ✅ Create virtual environment
- ✅ Install all dependencies
- ✅ Create .env file

---

## 🔑 Step 3: Add Your GoLogin Token

Edit the `.env` file:

```powershell
notepad .env
```

Add your GoLogin token:

```
GOLOGIN_TOKEN=your_actual_token_here
```

Save and close.

---

## ▶️ Step 4: Run the Service

```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Start the service
uvicorn app.main:app --reload --port 8001
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete.
```

---

## 🧪 Step 5: Test It!

**Open your browser:**
http://localhost:8001/docs

**Or use curl:**

```powershell
# Test health endpoint
curl http://localhost:8001/api/v1/health

# Test OAuth endpoint (use your real profile_id)
curl -X POST http://localhost:8001/api/v1/auth/x-oauth `
  -H "Content-Type: application/json" `
  -d '{\"profile_id\": \"YOUR_PROFILE_ID\", \"username\": \"user@email.com\"}'
```

---

## 🐛 Troubleshooting

### Script won't run?

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Python 3.11 not found?

Make sure you installed it from the link above and checked "Add to PATH"

### Dependencies fail to install?

```powershell
# Upgrade pip first
python -m pip install --upgrade pip setuptools wheel

# Try again
pip install -r requirements.txt
```

---

## ✅ Quick Checklist

- [ ] Python 3.11 installed
- [ ] Run `.\setup_python311.ps1`
- [ ] Edit `.env` with GOLOGIN_TOKEN
- [ ] Activate venv: `.\venv\Scripts\Activate.ps1`
- [ ] Start service: `uvicorn app.main:app --reload --port 8001`
- [ ] Visit http://localhost:8001/docs
- [ ] Test with your GoLogin profile

---

**Need more details?** See `PYTHON_VERSION_SETUP.md`
