# Centralized Browser Automation

Reusable browser automation utilities for all microservices.

## Overview

This module provides shared GoLogin and Selenium utilities to avoid code duplication across services.

## Components

### 1. GoLoginManager
Core GoLogin profile management.

```python
from shared.browser_automation import GoLoginManager

# Initialize
manager = GoLoginManager()

# Start session
session = manager.start_session(profile_id="67c5c1981ffcfef21b40b20e")

if session:
    driver = session['driver']
    # Use driver for automation...
    
    # Cleanup when done
    manager.cleanup_session(session)
```

**With Context Manager (Automatic Cleanup):**

```python
from shared.browser_automation.gologin_manager import GoLoginSession, GoLoginManager

manager = GoLoginManager()

with GoLoginSession(manager, profile_id) as session:
    driver = session['driver']
    driver.get('https://example.com')
    # ... automation code ...
# Session automatically cleaned up
```

### 2. BrowserProfileManager
Fetch GoLogin profile IDs by name.

```python
from shared.browser_automation import BrowserProfileManager

# Initialize
profile_manager = BrowserProfileManager()

# Get single profile ID
profile_id = profile_manager.get_profile_id_by_name("MyProfile")

# Get multiple profile IDs
profile_names = ["Profile1", "Profile2", "Profile3"]
profile_map = profile_manager.get_profile_ids_by_names(profile_names)
# Returns: {"Profile1": "id1", "Profile2": "id2", "Profile3": None}

# List all available profiles
all_profiles = profile_manager.list_profile_names()
```

### 3. SeleniumBase
Common Selenium utilities.

```python
from shared.browser_automation import SeleniumBase

# Initialize with driver
selenium_utils = SeleniumBase(driver, logger)

# Wait for elements
element = selenium_utils.wait_for_element("button.submit", timeout=10)

# Safe interactions
selenium_utils.safe_click("button.login")
selenium_utils.safe_type("input[name='username']", "myusername")

# Get element info
text = selenium_utils.get_text("h1.title")
url = selenium_utils.get_current_url()

# Screenshots
selenium_utils.take_screenshot("error.png")

# Human-like delays
selenium_utils.wait_random(min_seconds=2, max_seconds=5)
```

## Configuration

Environment variables (in root `.env`):

```ini
# Required
GOLOGIN_TOKEN=your_token_here

# Optional
GOLOGIN_LOCAL_MODE=true  # Use local Orbita instance
```

## Usage Examples

### Example 1: Simple Profile Launch

```python
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from shared.browser_automation import GoLoginManager

# Initialize and start
manager = GoLoginManager()
session = manager.start_session(profile_id="your_profile_id")

if session:
    driver = session['driver']
    driver.get('https://example.com')
    
    # Do automation...
    
    # Cleanup
    manager.cleanup_session(session)
```

### Example 2: Fetch Profile by Name

```python
from shared.browser_automation import BrowserProfileManager, GoLoginManager

# Get profile ID from name
profile_manager = BrowserProfileManager()
profile_id = profile_manager.get_profile_id_by_name("Production Profile")

if not profile_id:
    print("Profile not found!")
    exit(1)

# Launch profile
gologin_manager = GoLoginManager()
session = gologin_manager.start_session(profile_id)

# ... automation ...
```

### Example 3: Full Automation with Utilities

```python
from shared.browser_automation import (
    GoLoginManager, 
    BrowserProfileManager, 
    SeleniumBase
)

# Setup
profile_manager = BrowserProfileManager()
gologin_manager = GoLoginManager()

# Get profile
profile_id = profile_manager.get_profile_id_by_name("MyProfile")

# Start session
session = gologin_manager.start_session(profile_id)
driver = session['driver']
utils = SeleniumBase(driver)

try:
    # Navigate
    driver.get('https://example.com')
    
    # Wait for page load
    utils.wait_for_element('div.content')
    
    # Interact
    utils.safe_click('button.login')
    utils.safe_type('input[name="email"]', 'user@example.com')
    
    # Human-like delay
    utils.wait_random(2, 4)
    
    # Submit
    utils.safe_click('button[type="submit"]', press_enter=True)
    
    # Take screenshot
    utils.take_screenshot('success.png')

finally:
    gologin_manager.cleanup_session(session)
```

## Migration Guide

### Migrating from Direct GoLogin Usage

**Before:**
```python
from gologin import GoLogin

gl = GoLogin({
    "token": token,
    "profile_id": profile_id,
    "tmpdir": tmpdir
})

debugger_address = gl.start()
driver = connect_selenium(debugger_address)

# ... automation ...

driver.quit()
gl.stop()
```

**After:**
```python
from shared.browser_automation import GoLoginManager

manager = GoLoginManager()
session = manager.start_session(profile_id)

driver = session['driver']

# ... automation ...

manager.cleanup_session(session)
```

## Benefits

- **DRY**: No code duplication across services
- **Consistent**: Same patterns everywhere
- **Tested**: Centralized utilities are well-tested
- **Maintainable**: Fix once, benefits all services
- **Context Managers**: Automatic cleanup with `with` statement

## Services Using This Module

- ✅ **ig-engagement-service**: Instagram automation
- 🔄 **x-auth-service**: Can be migrated (currently uses direct GoLogin)

## Testing

Test the module independently:

```bash
# From project root
python -c "
from shared.browser_automation import GoLoginManager, BrowserProfileManager

# Test profile fetching
pm = BrowserProfileManager()
profiles = pm.list_profile_names()
print(f'Found {len(profiles)} profiles')

# Test GoLogin initialization
gm = GoLoginManager()
print('GoLogin manager initialized successfully')
"
```

## API Reference

### GoLoginManager

| Method | Description |
|--------|-------------|
| `__init__(gologin_token, local_mode)` | Initialize manager |
| `start_session(profile_id, headless)` | Start browser session |
| `cleanup_session(session_data)` | Clean up resources |

### BrowserProfileManager

| Method | Description |
|--------|-------------|
| `get_profile_id_by_name(name)` | Get single profile ID |
| `get_profile_ids_by_names(names)` | Get multiple profile IDs |
| `list_profile_names()` | List all available profiles |
| `clear_cache()` | Clear profile cache |

### SeleniumBase

| Method | Description |
|--------|-------------|
| `wait_for_element(selector, ...)` | Wait for element |
| `safe_click(selector, ...)` | Click with retries |
| `safe_type(selector, text, ...)` | Type into element |
| `scroll_to_element(element)` | Scroll element into view |
| `take_screenshot(filename)` | Capture screenshot |
| `wait_random(min, max)` | Human-like delay |

## Support

For issues or questions, see the main project documentation.

