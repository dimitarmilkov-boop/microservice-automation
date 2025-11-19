# THIS IS WHAT YOUR MICROSERVICE WORKER SHOULD DO
# Add this to: automation_service/services/x-auth-service/app/workers/x_worker.py

def run_x_oauth_automation(self, profile_id: str, api_app: str, job_id: str):
    """
    OAuth automation with AUTOMATIC LOGIN FALLBACK
    """
    driver = None
    gl = None
    
    try:
        # ━━━ STEP 1: Start GoLogin ━━━
        logger.info("[STEP 1] Starting GoLogin browser")
        gl = GoLogin({"token": gologin_token, "profile_id": profile_id})
        debugger_address = gl.start()
        
        # ━━━ STEP 2: Connect Selenium (FIX ChromeDriver!) ━━━
        logger.info("[STEP 2] Connecting Selenium")
        
        chrome_options = Options()
        chrome_options.add_experimental_option("debuggerAddress", debugger_address)
        
        # FIX: Use GoLogin's Chromium version OR auto-detect
        chromium_version = gl.get_chromium_version()
        service = Service(ChromeDriverManager(version=chromium_version).install())
        # OR: service = Service(ChromeDriverManager().install())  # Auto-detect
        
        driver = webdriver.Chrome(service=service, options=chrome_options)
        logger.info("✓ Selenium connected")
        
        # ━━━ STEP 3: Generate OAuth URL ━━━
        logger.info("[STEP 3] Generating OAuth URL")
        oauth_data = generate_oauth_url(profile_id, api_app)
        oauth_url = oauth_data['oauth_url']
        
        logger.info(f"OAuth URL: {oauth_url[:100]}...")
        
        # ━━━ STEP 4: Navigate to OAuth URL ━━━
        logger.info("[STEP 4] Navigating to OAuth URL")
        driver.get(oauth_url)
        time.sleep(3)
        
        logger.info(f"Current URL: {driver.current_url}")
        logger.info(f"Page title: {driver.title}")
        driver.save_screenshot("logs/oauth_page.png")
        
        # ━━━ STEP 5: CHECK PAGE STATE (CRITICAL!) ━━━
        logger.info("[STEP 5] Detecting page state")
        page_state = detect_page_state(driver)
        
        logger.info(f"Detected state: {page_state}")
        
        # ━━━ THIS IS WHAT WAS MISSING! ━━━
        if page_state == 'login_form':
            logger.warning("⚠️ ON LOGIN PAGE - AUTOMATIC LOGIN REQUIRED")
            
            # Get user credentials from database
            credentials = get_user_credentials(profile_id)
            
            if not credentials:
                raise Exception("No credentials found for automatic login")
            
            logger.info(f"Found credentials for: {credentials['account_name']}")
            logger.info(f"Has 2FA: {bool(credentials.get('2fa_secret'))}")
            
            # ━━━ AUTOMATIC LOGIN ━━━
            logger.info("🔐 ATTEMPTING AUTOMATIC LOGIN...")
            login_success = attempt_x_login(driver, credentials)
            
            if not login_success:
                raise Exception("Automatic login failed")
            
            logger.info("✓ Automatic login successful!")
            
            # ━━━ VERIFY HOME FEED ━━━
            if not detect_home_feed(driver):
                raise Exception("Login succeeded but home feed not detected")
            
            logger.info("✓ Reached home feed - session restored")
            driver.save_screenshot("logs/after_login.png")
            
            # ━━━ RE-NAVIGATE TO OAUTH URL ━━━
            logger.info("🔄 Re-navigating to OAuth URL after login...")
            driver.get(oauth_url)
            time.sleep(3)
            
            logger.info(f"Current URL after re-navigation: {driver.current_url}")
            driver.save_screenshot("logs/oauth_page_after_login.png")
            
            # ━━━ RE-DETECT PAGE STATE ━━━
            page_state = detect_page_state(driver)
            logger.info(f"New page state: {page_state}")
        
        # ━━━ STEP 6: VERIFY WE'RE ON AUTHORIZATION PAGE ━━━
        if page_state != 'authorization_form':
            raise Exception(f"Expected authorization form, got: {page_state}")
        
        logger.info("✓ On OAuth authorization page")
        
        # ━━━ STEP 7: CLICK AUTHORIZE ━━━
        logger.info("[STEP 7] Clicking authorize button")
        
        selectors = [
            '[data-testid="OAuth2Consent_Approval_Button"]',
            'input[id="allow"]',
            'button[type="submit"]'
        ]
        
        button_clicked = False
        for selector in selectors:
            try:
                button = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                )
                logger.info(f"✓ Found button: {selector}")
                driver.save_screenshot("logs/before_authorize.png")
                
                button.click()
                logger.info("✓ Clicked authorize button")
                driver.save_screenshot("logs/after_authorize.png")
                
                button_clicked = True
                break
            except:
                continue
        
        if not button_clicked:
            raise Exception("Failed to click authorize button")
        
        # ━━━ STEP 8: WAIT FOR CALLBACK ━━━
        logger.info("[STEP 8] Waiting for callback redirect...")
        
        start_time = time.time()
        while time.time() - start_time < 15:
            current_url = driver.current_url.lower()
            
            if 'aiott.pro' in current_url and 'code=' in current_url:
                logger.info(f"✓ CALLBACK DETECTED: {driver.current_url}")
                driver.save_screenshot("logs/callback.png")
                
                # Extract code
                params = urllib.parse.parse_qs(urllib.parse.urlparse(driver.current_url).query)
                code = params.get('code', [None])[0]
                state = params.get('state', [None])[0]
                
                logger.info(f"✓ OAuth code: {code[:20]}...")
                logger.info(f"✓ State: {state[:30]}...")
                
                return {
                    'success': True,
                    'code': code,
                    'state': state
                }
            
            time.sleep(0.5)
        
        raise Exception("Callback timeout - no redirect detected")
        
    except Exception as e:
        logger.error(f"❌ OAuth automation failed: {e}")
        if driver:
            driver.save_screenshot("logs/error.png")
        raise
    
    finally:
        if driver:
            driver.quit()
        if gl:
            gl.stop()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HELPER FUNCTIONS YOU NEED
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def get_user_credentials(profile_id: str) -> dict:
    """Get X login credentials from database"""
    cursor.execute("""
        SELECT account_name, custom_prompt
        FROM twitter_accounts
        WHERE profile_id = ?
    """, (profile_id,))
    
    result = cursor.fetchone()
    if not result:
        return None
    
    account_name, custom_prompt = result
    
    # Parse: CSV_PASSWORD:xxx|2FA_SECRET:xxx
    credentials = {'account_name': account_name}
    
    for part in custom_prompt.split('|'):
        if 'CSV_PASSWORD:' in part:
            credentials['password'] = part.split('CSV_PASSWORD:')[1].strip()
        elif '2FA_SECRET:' in part:
            credentials['2fa_secret'] = part.split('2FA_SECRET:')[1].strip()
    
    return credentials


def detect_page_state(driver) -> str:
    """Detect what page we're on"""
    url = driver.current_url.lower()
    page_source = driver.page_source.lower()
    
    # Check for authorization page
    if 'oauth2/authorize' in url or 'oauth/authorize' in url:
        # Look for authorize button
        try:
            driver.find_element(By.CSS_SELECTOR, '[data-testid="OAuth2Consent_Approval_Button"]')
            return 'authorization_form'
        except:
            pass
    
    # Check for login page
    if '/i/flow/login' in url or '/login' in url:
        return 'login_form'
    
    # Check for home feed
    if '/home' in url:
        return 'already_logged_in'
    
    return 'unknown'


def attempt_x_login(driver, credentials: dict) -> bool:
    """
    Attempt X login with username/password/2FA
    THIS IS THE SAME CODE FROM BULK LOGIN!
    """
    try:
        # Navigate to login if not already there
        if '/i/flow/login' not in driver.current_url:
            driver.get("https://x.com/i/flow/login")
            time.sleep(3)
        
        logger.info(f"Logging in as: {credentials['account_name']}")
        
        # Enter username
        username_selectors = [
            'input[name="text"]',
            'input[autocomplete="username"]',
            'input[type="text"]'
        ]
        
        for selector in username_selectors:
            try:
                username_field = driver.find_element(By.CSS_SELECTOR, selector)
                username_field.clear()
                username_field.send_keys(credentials['account_name'])
                logger.info("✓ Username entered")
                time.sleep(1)
                break
            except:
                continue
        
        # Click Next button
        next_selectors = [
            'button:contains("Next")',
            'button[type="button"]',
            'div[role="button"]'
        ]
        
        for selector in next_selectors:
            try:
                if ':contains' in selector:
                    buttons = driver.find_elements(By.TAG_NAME, 'button')
                    for btn in buttons:
                        if 'next' in btn.text.lower():
                            btn.click()
                            logger.info("✓ Next button clicked")
                            time.sleep(2)
                            break
                else:
                    button = driver.find_element(By.CSS_SELECTOR, selector)
                    button.click()
                    logger.info("✓ Next button clicked")
                    time.sleep(2)
                break
            except:
                continue
        
        # Enter password
        password_selectors = [
            'input[name="password"]',
            'input[type="password"]'
        ]
        
        for selector in password_selectors:
            try:
                password_field = driver.find_element(By.CSS_SELECTOR, selector)
                password_field.clear()
                password_field.send_keys(credentials['password'])
                logger.info("✓ Password entered")
                time.sleep(1)
                break
            except:
                continue
        
        # Click Login button
        login_selectors = [
            'button[data-testid="LoginForm_Login_Button"]',
            'button:contains("Log in")',
            'button[type="submit"]'
        ]
        
        for selector in login_selectors:
            try:
                if ':contains' in selector:
                    buttons = driver.find_elements(By.TAG_NAME, 'button')
                    for btn in buttons:
                        if 'log in' in btn.text.lower():
                            btn.click()
                            logger.info("✓ Login button clicked")
                            time.sleep(3)
                            break
                else:
                    button = driver.find_element(By.CSS_SELECTOR, selector)
                    button.click()
                    logger.info("✓ Login button clicked")
                    time.sleep(3)
                break
            except:
                continue
        
        # Handle 2FA if needed
        if '2fa_secret' in credentials and credentials['2fa_secret']:
            logger.info("Checking for 2FA...")
            
            try:
                # Look for 2FA input
                twofa_input = driver.find_element(By.CSS_SELECTOR, 'input[name="text"]')
                
                # Generate TOTP code
                import pyotp
                totp = pyotp.TOTP(credentials['2fa_secret'])
                code = totp.now()
                
                logger.info(f"Generated 2FA code: {code}")
                
                twofa_input.clear()
                twofa_input.send_keys(code)
                twofa_input.send_keys("\n")
                
                logger.info("✓ 2FA code entered")
                time.sleep(3)
                
            except:
                logger.info("No 2FA required")
        
        return True
        
    except Exception as e:
        logger.error(f"Login failed: {e}")
        return False


def detect_home_feed(driver) -> bool:
    """Check if we reached the home feed"""
    url = driver.current_url.lower()
    
    if '/home' in url or '/timeline' in url:
        logger.info("✓ On home feed")
        return True
    
    return False

