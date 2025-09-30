# 🚀 START HERE - Quick Setup

## ✅ Python 3.11 is Installed!

I can see Python 3.11.9 is installed on your system. The issue is that Windows is using Python 3.13 by default, but we can work around this.

---

## 🎯 One-Click Setup

Run this command in the terminal:

```cmd
cd C:\Users\Dimitar\Desktop\automation_service\services\x-auth-service

setup.bat
```

This will:

1. ✅ Create virtual environment with Python 3.11
2. ✅ Install all dependencies
3. ✅ Create .env file
4. ✅ Verify everything works

---

## 📝 Then Configure & Run

### Step 1: Add Your GoLogin Token

```cmd
notepad .env
```

Add this line:

```
GOLOGIN_TOKEN=your_actual_token_here
```

Save and close.

### Step 2: Start the Service

```cmd
venv\Scripts\activate
uvicorn app.main:app --reload --port 8001
```

### Step 3: Test It!

Open browser: http://localhost:8001/docs

---

## 🧪 Test the API

```powershell
# Health check
curl http://localhost:8001/api/v1/health

# OAuth automation (use your real profile_id from dump_x.csv)
curl -X POST http://localhost:8001/api/v1/auth/x-oauth ^
  -H "Content-Type: application/json" ^
  -d "{\"profile_id\": \"YOUR_PROFILE_ID\", \"username\": \"user@email.com\"}"
```

---

## 💡 Key Point

**Inside the virtual environment (venv), Python will be 3.11, not 3.13!**

```cmd
# Before activating venv
python --version  # Shows 3.13.5

# After activating venv
venv\Scripts\activate
python --version  # Shows 3.11.9 ✅
```

---

## 🎯 Ready?

Just run:

```cmd
setup.bat
```

That's it!
