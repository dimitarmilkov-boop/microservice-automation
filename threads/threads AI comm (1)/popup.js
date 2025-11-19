// ThreadsAI Extension Popup Script

// Language Translations
const translations = {
    en: {
        // Header
        logoTitle: "ThreadsAI",
        settingsBtn: "Settings",
        stopped: "Stopped",
        running: "Running",
        paused: "Paused",
        
        // Main controls  
        startBtn: "Start",
        pauseBtn: "Pause",
        stopBtn: "Stop",
        
        // Quick settings
        posts: "Posts:",
        delay: "Delay:",
        actionsPerHour: "Actions/hour:",
        autoLikes: "❤️ Auto Likes",
        stealthMode: "🥷 Stealth Mode",
        
        // Filters
        filters: "🔍 Filters",
        postsFilter: "Posts",
        languagesFilter: "Languages", 
        usersFilter: "Users",
        duplicatesFilter: "Duplicate Posts",
        keywordFilter: "Keywords",
        
        // Safety
        safety: "🛡️ Safety",
        avoidDuplicates: "Avoid duplicates",
        respectLimits: "Respect limits",
        uniqueWords: "Unique words",
        
        // Theme
        themeSection: "🎨 Theme",
        lightTheme: "Light",
        darkTheme: "Dark", 
        autoTheme: "Auto",
        
        // Language
        languageSection: "🌐 Language",
        russian: "Русский",
        english: "English",
        
        // AI
        aiGeneration: "🤖 AI comment generation",
        aiDescription: "Automatic creation of relevant comments",
        expandedSettings: "⚙️ Extended Settings",
        byEvheshka: "by Evheshka",
        
        // AI Settings
        provider: "Provider:",
        apiKey: "API Key",
        model: "Model:",
        testBtn: "Test",
        enterApiKey: "Enter API key",
        apiKeySaved: "API key saved",
        apiKeyChanged: "API key changed (press Test)",
        fastCheap: "(fast, cheap)",
        quality: "(quality)",
        basic: "(basic)",
        
        // AI Models
        openrouterModels: {
            "anthropic/claude-3.5-sonnet:beta": "Claude 3.5 Sonnet (high quality)",
            "openai/gpt-4o": "GPT-4o (high quality)", 
            "openai/gpt-4o-mini": "GPT-4o Mini (fast, cheap)",
            "meta-llama/llama-3.1-8b-instruct:free": "Llama 3.1 8B (free)",
            "qwen/qwen-2-7b-instruct:free": "Qwen 2 7B (free)",
            "openai/gpt-3.5-turbo": "GPT-3.5 Turbo (basic)",
            "google/gemma-7b-it:free": "Gemma 7B (free)",
            "custom": "Custom model"
        },
        
        // Content script  
        quickSettings: "Quick Settings",
        quickActions: "⚡ Quick Actions",
        logEmpty: "Log is empty",
        panelInitialized: "Bottom panel initialized",
        
        // Buttons
        save: "💾 Save",
        fullSettings: "⚙️ Full Settings",
        
        // Time units
        sec: "sec",
        min: "min",
        hour: "hour"
    },
    ru: {
        // Header
        logoTitle: "ThreadsAI",
        settingsBtn: "Настройки",
        stopped: "Остановлено",
        running: "Работает", 
        paused: "Приостановлено",
        
        // Main controls
        startBtn: "Запустить",
        pauseBtn: "Пауза",
        stopBtn: "Стоп",
        
        // Quick settings
        posts: "Постов:",
        delay: "Задержка:",
        actionsPerHour: "Действий/час:",
        autoLikes: "❤️ Автолайки",
        stealthMode: "🥷 Скрытный режим",
        
        // Filters
        filters: "🔍 Фильтры", 
        postsFilter: "Посты",
        languagesFilter: "Языки",
        usersFilter: "Пользователи",
        duplicatesFilter: "Дубликаты постов",
        keywordFilter: "Ключевые слова",
        
        // Safety
        safety: "🛡️ Безопасность",
        avoidDuplicates: "Избегать дубликатов",
        respectLimits: "Соблюдать лимиты",
        uniqueWords: "Уникальные пользователи",
        
        // Theme
        themeSection: "🎨 Тема",
        lightTheme: "Светлая",
        darkTheme: "Темная",
        autoTheme: "Авто",
        
        // Language
        languageSection: "🌐 Язык",
        russian: "Русский",
        english: "English",
        
        // AI
        aiGeneration: "🤖 ИИ генерация комментариев",
        aiDescription: "Автоматическое создание релевантных комментариев",
        expandedSettings: "⚙️ Расширенные настройки",
        byEvheshka: "by Evheshka",
        
        // AI Settings
        provider: "Провайдер:",
        apiKey: "API ключ",
        model: "Модель:",
        testBtn: "Тест",
        enterApiKey: "Введите API ключ",
        apiKeySaved: "API ключ сохранен",
        apiKeyChanged: "API ключ изменен (нажмите Тест)",
        fastCheap: "(быстро, дешево)",
        quality: "(качественно)",
        basic: "(базовая)",
        
        // AI Models
        openrouterModels: {
            "anthropic/claude-3.5-sonnet:beta": "Claude 3.5 Sonnet (качественно)",
            "openai/gpt-4o": "GPT-4o (качественно)",
            "openai/gpt-4o-mini": "GPT-4o Mini (быстро, дешево)",
            "meta-llama/llama-3.1-8b-instruct:free": "Llama 3.1 8B (бесплатно)",
            "qwen/qwen-2-7b-instruct:free": "Qwen 2 7B (бесплатно)",
            "openai/gpt-3.5-turbo": "GPT-3.5 Turbo (базовая)",
            "google/gemma-7b-it:free": "Gemma 7B (бесплатно)",
            "custom": "Своя модель"
        },
        
        // Content script
        quickSettings: "Быстрые настройки", 
        quickActions: "⚡ Быстрые действия",
        logEmpty: "Лог пуст",
        panelInitialized: "Нижняя панель инициализирована",
        
        // Buttons
        save: "💾 Сохранить",
        fullSettings: "⚙️ Полные настройки",
        
        // Time units
        sec: "сек",
        min: "мин", 
        hour: "час"
    }
};

class ThreadsAIPopup {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.keywordSearchActive = false;
        this.keywordInfo = {
            currentKeyword: null,
            currentKeywordIndex: 0,
            totalKeywords: 0
        };
        this.stats = {
            comments: 0,
            likes: 0,
            progress: 0,
            startTime: null
        };
        this.currentLanguage = 'ru'; // Default language
        
        this.init();
    }

    // Theme Management
    async detectSystemTheme() {
        try {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return isDark ? 'dark' : 'light';
        } catch (error) {
            console.log('Could not detect system theme, defaulting to light');
            return 'light';
        }
    }

    async applyTheme(theme) {
        console.log(`🎨 Applying theme: ${theme}`);
        
        let actualTheme = theme;
        if (theme === 'auto') {
            actualTheme = await this.detectSystemTheme();
            console.log(`🔄 Auto theme resolved to: ${actualTheme}`);
        }
        
        // Apply to document
        document.body.setAttribute('data-theme', actualTheme);
        
        // Save current theme to storage
        await chrome.storage.sync.set({ theme: theme, appliedTheme: actualTheme });
        
        // Notify content script about theme change
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.id) {
                chrome.tabs.sendMessage(tab.id, { 
                    action: 'themeChanged', 
                    theme: actualTheme 
                }).catch(() => {
                    // Content script might not be loaded, that's okay
                });
            }
        } catch (error) {
            console.log('Could not notify content script about theme change');
        }
    }

    async loadTheme() {
        try {
            const result = await chrome.storage.sync.get(['theme']);
            const savedTheme = result.theme || 'auto';
            
            // Set radio button
            const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
            if (themeRadio) {
                themeRadio.checked = true;
            }
            
            // Apply theme
            await this.applyTheme(savedTheme);
            
            console.log(`✅ Loaded theme: ${savedTheme}`);
        } catch (error) {
            console.error('Error loading theme:', error);
            await this.applyTheme('auto'); // fallback
        }
    }

    // Language Management
    t(key) {
        return translations[this.currentLanguage][key] || translations['ru'][key] || key;
    }

    async loadLanguage() {
        try {
            const result = await chrome.storage.sync.get(['language']);
            const savedLanguage = result.language || 'ru';
            this.currentLanguage = savedLanguage;
            
            // Set radio button
            const languageRadio = document.querySelector(`input[name="language"][value="${savedLanguage}"]`);
            if (languageRadio) {
                languageRadio.checked = true;
            }
            
            this.updateUILanguage();
        } catch (error) {
            console.error('Error loading language:', error);
            this.currentLanguage = 'ru';
            this.updateUILanguage();
        }
    }

    async applyLanguage(language) {
        this.currentLanguage = language;
        
        try {
            await chrome.storage.sync.set({ language });
            this.updateUILanguage();
            
            // Notify content script about language change
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'languageChanged',
                        language: language
                    }).catch(() => {
                        // Content script might not be loaded, that's okay
                    });
                }
            } catch (error) {
                console.log('Could not notify content script about language change');
            }
        } catch (error) {
            console.error('Error saving language:', error);
        }
    }

    updateUILanguage() {
        // Update elements with data-lang attributes
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[this.currentLanguage][key]) {
                element.textContent = translations[this.currentLanguage][key];
            }
        });
        
        // Update placeholders with data-lang-placeholder attributes
        document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
            const key = element.getAttribute('data-lang-placeholder');
            if (translations[this.currentLanguage][key]) {
                if (key === 'apiKey') {
                    // For API key inputs, keep the format hint
                    const provider = element.id.includes('openai') ? 'sk-proj-' : 'sk-or-v1-';
                    element.placeholder = `${translations[this.currentLanguage][key]} (${provider}...)`;
                } else {
                    element.placeholder = translations[this.currentLanguage][key];
                }
            }
        });
        
        // Update select option text content for model descriptions
        const openaiSelect = document.getElementById('openaiModel');
        if (openaiSelect) {
            const options = openaiSelect.options;
            if (options[0]) options[0].textContent = `GPT-4o Mini ${this.t('fastCheap')}`;
            if (options[1]) options[1].textContent = `GPT-4o ${this.t('quality')}`;
            if (options[2]) options[2].textContent = `GPT-3.5 Turbo ${this.t('basic')}`;
        }
        
        // Update OpenRouter model options
        const openrouterSelect = document.getElementById('openrouterModel');
        if (openrouterSelect && translations[this.currentLanguage].openrouterModels) {
            const options = openrouterSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                const modelTranslation = translations[this.currentLanguage].openrouterModels[value];
                if (modelTranslation) {
                    option.textContent = modelTranslation;
                }
            });
        }
    }

    setupThemeListeners() {
        // Theme radio buttons
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    await this.applyTheme(e.target.value);
                }
            });
        });
        
        // Language radio buttons
        const languageRadios = document.querySelectorAll('input[name="language"]');
        languageRadios.forEach(radio => {
            radio.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    await this.applyLanguage(e.target.value);
                }
            });
        });
        
        // System theme change detection
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
                const currentSetting = document.querySelector('input[name="theme"]:checked')?.value;
                if (currentSetting === 'auto') {
                    await this.applyTheme('auto');
                }
            });
        }
    }

    async checkContentScriptReady(tabId, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                // Send ping message to check if content script is ready
                await chrome.tabs.sendMessage(tabId, { action: 'ping' });
                console.log(`✅ Content script is ready on attempt ${i + 1}`);
                return true;
            } catch (error) {
                console.log(`⏳ Content script not ready, attempt ${i + 1}/${maxRetries}`);
                
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        return false;
    }

    async sendMessageWithRetry(tabId, message, maxRetries = 5, delay = 1000) {
        // First, check if content script is ready
        console.log('📡 Checking content script readiness...');
        const isReady = await this.checkContentScriptReady(tabId);
        
        if (!isReady) {
            throw new Error('Content script не загружен или не отвечает. Попробуйте обновить страницу (F5) и запустить снова.');
        }
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                // Try to send message
                await chrome.tabs.sendMessage(tabId, message);
                console.log(`✅ Message sent successfully on attempt ${i + 1}`);
                return; // Success
            } catch (error) {
                console.log(`⏳ Attempt ${i + 1}/${maxRetries} failed: ${error.message}`);
                
                if (i === maxRetries - 1) {
                    // Last attempt failed
                    throw new Error(`Content script не отвечает после ${maxRetries} попыток. Попробуйте обновить страницу (F5) и запустить снова.`);
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Increase delay for next attempt
                delay = Math.min(delay * 1.5, 5000);
            }
        }
    }

    async init() {
        // Load theme and language first (before UI setup)
        await this.loadTheme();
        await this.loadLanguage();
        
        await this.loadSettings();
        this.bindEvents();
        
        // Setup theme and language listeners
        this.setupThemeListeners();
        
        await this.syncWithActiveState();
        this.updateUI();
        this.startStatsTimer();
        
        // Initialize AI settings UI
                    await this.toggleAISettings(document.getElementById('enableAI').checked);
        
        // Check if we're on Threads.net
        this.checkCurrentTab();
    }

    async syncWithActiveState() {
        try {
            // Check if keyword search is currently active
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Request current state from content script
            try {
                await chrome.tabs.sendMessage(tab.id, { action: 'getState' });
            } catch (error) {
                // Content script not loaded or not on Threads page - that's ok
                console.log('Content script not available for state sync');
            }
        } catch (error) {
            console.log('Error syncing with active state:', error);
        }
    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get({
                maxPosts: 50,
                minDelay: 30,
                maxDelay: 120,
                autoLike: true,
                autoComment: true,
                stealthMode: true,
                respectLimits: true,
                avoidDuplicates: true,
                avoidDuplicateUsers: false,
                actionsPerHour: 15,
                // Post Filter Settings
                enablePostFilter: false,
                minLikes: 0,
                maxLikes: 1000,
                minComments: 0,
                maxComments: 100,
                // Keyword Search Settings
                enableKeywordSearch: false,
                // Language Filter Settings
                enableLanguageFilter: false,
                // User Filter Settings
                enableUserFilter: false,
                searchKeywords: ['программирование', 'искусственный интеллект', 'веб разработка'],
                searchSection: 'top',
                maxPostsPerKeyword: 10,
                keywordDelay: 30,
                randomizeKeywords: true,
                // AI Settings
                enableAI: false,
                aiProvider: 'openrouter',
                openaiApiKey: '',
                openaiModel: 'gpt-4o-mini',
                // OpenRouter Settings
                openrouterApiKey: '',
                openrouterModel: 'openai/gpt-4o-mini',
                customModel: '',
                // Groq Settings
                groqApiKey: '',
                groqModel: 'llama-3.1-8b-instant',
                groqCustomModel: '',
                // Gemini Settings
                geminiApiKey: '',
                geminiModel: 'gemini-2.5-flash',
                geminiCustomModel: ''
            });

            // Check for deprecated Groq models and fix them
            await this.checkAndFixDeprecatedModels(settings);

            // Update UI with settings
            document.getElementById('maxPosts').value = settings.maxPosts;
            document.getElementById('minDelay').value = settings.minDelay;
            document.getElementById('maxDelay').value = settings.maxDelay;
            document.getElementById('autoLike').checked = settings.autoLike;
            // Note: autoComment is controlled by AI toggle, no separate UI element
            document.getElementById('stealthMode').checked = settings.stealthMode;
            document.getElementById('respectLimits').checked = settings.respectLimits;
            document.getElementById('avoidDuplicates').checked = settings.avoidDuplicates;
            document.getElementById('avoidDuplicateUsers').checked = settings.avoidDuplicateUsers;
            document.getElementById('actionsPerHour').value = settings.actionsPerHour;
            
            // Post filter setting (only the toggle)
            document.getElementById('enablePostFilter').checked = settings.enablePostFilter;
            
            // Keyword search setting (only the toggle)
            document.getElementById('enableKeywordSearch').checked = settings.enableKeywordSearch;
            
            // Language filter setting (only the toggle)
            document.getElementById('enableLanguageFilter').checked = settings.enableLanguageFilter;
            
            // User filter setting (only the toggle)
            document.getElementById('enableUserFilter').checked = settings.enableUserFilter;
            
            // Update AI settings
            document.getElementById('enableAI').checked = settings.enableAI;
            document.getElementById('aiProvider').value = settings.aiProvider;
            
            // AI provider settings
            document.getElementById('openaiApiKey').value = settings.openaiApiKey;
            document.getElementById('openaiModel').value = settings.openaiModel;
            document.getElementById('openrouterApiKey').value = settings.openrouterApiKey;
            document.getElementById('openrouterModel').value = settings.openrouterModel;
            document.getElementById('groqApiKey').value = settings.groqApiKey || '';
            document.getElementById('groqModel').value = settings.groqModel || 'llama-3.1-8b-instant';
            document.getElementById('groqCustomModel').value = settings.groqCustomModel || '';
            document.getElementById('geminiApiKey').value = settings.geminiApiKey || '';
            document.getElementById('geminiModel').value = settings.geminiModel || 'gemini-2.5-flash';
            document.getElementById('geminiCustomModel').value = settings.geminiCustomModel || '';
            
            // Initialize provider display
            await this.toggleProviderSettings(settings.aiProvider);
            this.toggleGroqCustomModel(settings.groqModel);
            this.toggleGeminiCustomModel(settings.geminiModel);
            
            // Update AI status based on current provider's API key
            let currentApiKey = '';
            if (settings.aiProvider === 'openai') {
                currentApiKey = settings.openaiApiKey;
            } else if (settings.aiProvider === 'openrouter') {
                currentApiKey = settings.openrouterApiKey;
            } else if (settings.aiProvider === 'groq') {
                currentApiKey = settings.groqApiKey || '';
            }
            this.updateAIStatus('default', currentApiKey ? this.t('apiKeySaved') : this.t('enterApiKey'));
            
            // Apply visual feedback for valid keys
            if (currentApiKey) {
                this.updateApiKeyVisual('valid');
            }

            // Load stats (support both legacy `stats` and new `persistentStats` keys)
            const statsPayload = await chrome.storage.local.get(['persistentStats', 'stats']);
            const statsFromPersistent = statsPayload?.persistentStats?.stats;
            const statsFromLegacy = statsPayload?.stats;
            const mergedStats = statsFromPersistent || statsFromLegacy;
            if (mergedStats) {
                this.stats = { ...this.stats, ...mergedStats };
            }
            this.updateStatsDisplay();

        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async checkAndFixDeprecatedModels(settings) {
        const deprecatedGroqModels = ['mixtral-8x7b-32768', 'llama-3.1-70b-versatile'];
        if (deprecatedGroqModels.includes(settings.groqModel)) {
            const oldModel = settings.groqModel;
            settings.groqModel = 'llama-3.1-8b-instant';
            console.log(`⚠️ Deprecated Groq model "${oldModel}" replaced with "llama-3.1-8b-instant"`);
            // Save the corrected setting
            await chrome.storage.sync.set({ groqModel: settings.groqModel });
        }
    }

    async saveSettings() {
        try {
            const settings = {
                maxPosts: parseInt(document.getElementById('maxPosts').value),
                minDelay: parseInt(document.getElementById('minDelay').value),
                maxDelay: parseInt(document.getElementById('maxDelay').value),
                autoLike: document.getElementById('autoLike').checked,
                autoComment: true, // Always enabled when using the extension
                stealthMode: document.getElementById('stealthMode').checked,
                respectLimits: document.getElementById('respectLimits').checked,
                avoidDuplicates: document.getElementById('avoidDuplicates').checked,
                avoidDuplicateUsers: document.getElementById('avoidDuplicateUsers').checked,
                actionsPerHour: parseInt(document.getElementById('actionsPerHour').value),
                // Post Filter Settings
                enablePostFilter: document.getElementById('enablePostFilter').checked,
                // Keyword Search Settings
                enableKeywordSearch: document.getElementById('enableKeywordSearch').checked,
                // Language Filter Settings
                enableLanguageFilter: document.getElementById('enableLanguageFilter').checked,
                // User Filter Settings
                enableUserFilter: document.getElementById('enableUserFilter').checked,
                // AI Settings
                enableAI: document.getElementById('enableAI').checked,
                aiProvider: document.getElementById('aiProvider').value,
                openaiApiKey: document.getElementById('openaiApiKey').value,
                openaiModel: document.getElementById('openaiModel').value,
                openrouterApiKey: document.getElementById('openrouterApiKey').value,
                openrouterModel: document.getElementById('openrouterModel').value,
                customModel: '',
                groqApiKey: document.getElementById('groqApiKey').value,
                groqModel: document.getElementById('groqModel').value,
                groqCustomModel: document.getElementById('groqCustomModel').value,
                geminiApiKey: document.getElementById('geminiApiKey').value,
                geminiModel: document.getElementById('geminiModel').value,
                geminiCustomModel: document.getElementById('geminiCustomModel').value
            };

            await chrome.storage.sync.set(settings);
            console.log('Settings saved');
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    bindEvents() {
        // Main action buttons
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());

        // Settings buttons
        document.getElementById('settingsBtn').addEventListener('click', () => this.openAdvancedSettings());

        // AI toggle handler
        document.getElementById('enableAI').addEventListener('change', async (e) => {
            await this.toggleAISettings(e.target.checked);
            this.saveSettings();
        });

        // AI provider change handler
        document.getElementById('aiProvider').addEventListener('change', async (e) => {
            await this.toggleProviderSettings(e.target.value);
            this.saveSettings();
        });

        // Groq model change handler
        document.getElementById('groqModel').addEventListener('change', (e) => {
            this.toggleGroqCustomModel(e.target.value);
            this.saveSettings();
        });

        // Gemini model change handler
        document.getElementById('geminiModel').addEventListener('change', (e) => {
            this.toggleGeminiCustomModel(e.target.value);
            this.saveSettings();
        });

        // Test API button handlers for both providers
        const testBtns = document.querySelectorAll('.btn-test');
        testBtns.forEach(btn => {
            btn.addEventListener('click', () => this.testApiKey());
        });

        // Setup API key validation
        this.setupApiKeyValidation();
        
        // Load saved API key validation states
        this.loadApiKeyValidationStates();

        // Post filter toggle handler (just save settings)
        document.getElementById('enablePostFilter').addEventListener('change', () => {
            this.saveSettings();
        });

        // Keyword search toggle handler (just save settings)
        document.getElementById('enableKeywordSearch').addEventListener('change', () => {
            this.saveSettings();
        });



        // Auto-save settings on change
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.saveSettings();
                
                // Update AI status when API key changes
                if (input.id === 'openaiApiKey' || input.id === 'openrouterApiKey' || input.id === 'groqApiKey') {
                    const provider = document.getElementById('aiProvider').value;
                    const isCurrentProvider = (input.id === 'openaiApiKey' && provider === 'openai') || 
                                            (input.id === 'openrouterApiKey' && provider === 'openrouter') ||
                                            (input.id === 'groqApiKey' && provider === 'groq');
                    
                    if (isCurrentProvider) {
                        this.updateAIStatus('default', input.value.trim() ? this.t('apiKeyChanged') : this.t('enterApiKey'));
                        this.updateApiKeyVisual('default');
                    }
                }
            });
        });
    }

    async checkCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('threads.net') && !tab.url.includes('threads.com')) {
                this.showWarning('Откройте threads.net или threads.com для использования расширения');
                this.disableControls();
            } else {
                this.enableControls();
                console.log('Threads detected on:', tab.url);
            }
        } catch (error) {
            console.error('Error checking current tab:', error);
        }
    }

    async start() {
        try {
            await this.saveSettings();
            
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('threads.net') && !tab.url.includes('threads.com')) {
                this.showWarning('Сначала перейдите на threads.net или threads.com');
                return;
            }

            // Send message to content script with retry logic
            const settings = await this.getSettings();
            await this.sendMessageWithRetry(tab.id, {
                action: 'start',
                settings: settings
            });

            this.isRunning = true;
            this.isPaused = false;
            
            this.updateUI();
            this.showProgress();
            
            console.log('ThreadsAI started');
        } catch (error) {
            console.error('Error starting ThreadsAI:', error);
            this.showError('Ошибка запуска: ' + error.message);
        }
    }

    async pause() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await this.sendMessageWithRetry(tab.id, {
                action: 'pause'
            });

            this.isPaused = !this.isPaused;
            this.updateUI();
            

            
            console.log('ThreadsAI paused:', this.isPaused);
        } catch (error) {
            console.error('Error pausing ThreadsAI:', error);
        }
    }

    async stop() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await this.sendMessageWithRetry(tab.id, {
                action: 'stop'
            });

            this.isRunning = false;
            this.isPaused = false;
            
            this.updateUI();
            this.hideProgress();
            
            console.log('ThreadsAI stopped');
        } catch (error) {
            console.error('Error stopping ThreadsAI:', error);
        }
    }

    async getSettings() {
        const settings = await chrome.storage.sync.get({
            // Basic settings
            maxPosts: 50,
            minDelay: 30,
            maxDelay: 120,
            autoLike: true,
            autoComment: true,
            stealthMode: true,
            respectLimits: true,
            avoidDuplicates: true,
            avoidDuplicateUsers: false,
            actionsPerHour: 15,
            // Post Filter Settings
            enablePostFilter: false,
            minLikes: 0,
            maxLikes: 1000,
            minComments: 0,
            maxComments: 100,
            // Content Type Filters
            filterPhotoOnly: false,
            filterVideoOnly: false,
            filterTextMedia: true,
            filterTextOnly: true,
            // Keyword Search Settings
            enableKeywordSearch: false,
            // Language Filter Settings
            enableLanguageFilter: false,
            // User Filter Settings
            enableUserFilter: false,
            searchKeywords: ['программирование', 'искусственный интеллект', 'веб разработка'],
            searchSection: 'top',
            maxPostsPerKeyword: 10,
            keywordDelay: 30,
            randomizeKeywords: true,
            cyclicSearch: false,
            // AI Settings with defaults
            enableAI: false,
            aiProvider: 'openrouter',
            openaiApiKey: '',
            openaiModel: 'gpt-4o-mini',
            // OpenRouter Settings
            openrouterApiKey: '',
            openrouterModel: 'openai/gpt-4o-mini',
            customModel: '',
            aiPrompt: `Ты должен написать короткий релевантный комментарий к посту в социальной сети на русском языке. Комментарий должен быть:
- Длиной 1-2 предложения  
- Естественным и дружелюбным
- Подходящим по теме поста
- Без излишней активности или спама

Текст поста: {POST_TEXT}

Напиши только комментарий, без лишних пояснений:`,
            // Manual Templates (fallback)
            comments: [
                'Отличный пост! 👍',
                'Спасибо за информацию!',
                'Интересная мысль 🤔',
                'Согласен с вами! 💯',
                'Классный контент! 🔥'
            ]
        });
        
        console.log('Settings being sent to content script:', settings);
        return settings;
    }

    updateUI() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');

        if (this.isRunning) {
            if (this.isPaused) {
                statusText.textContent = this.t('paused');
                statusText.setAttribute('data-lang', 'paused');
                statusDot.className = 'dot paused';
                pauseBtn.querySelector('span:last-child').textContent = this.t('startBtn');
            } else if (this.keywordSearchActive) {
                statusText.textContent = this.t('running');
                statusText.setAttribute('data-lang', 'running');
                statusDot.className = 'dot running';
                pauseBtn.querySelector('span:last-child').textContent = this.t('pauseBtn');
            } else {
                statusText.textContent = this.t('running');
                statusText.setAttribute('data-lang', 'running');
                statusDot.className = 'dot running';
                pauseBtn.querySelector('span:last-child').textContent = this.t('pauseBtn');
            }
            
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
        } else {
            statusText.textContent = this.t('stopped');
            statusText.setAttribute('data-lang', 'stopped');
            statusDot.className = 'dot';
            
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            pauseBtn.querySelector('span:last-child').textContent = this.t('pauseBtn');
        }
    }



    updateStatsDisplay() {
        const commentsEl = document.getElementById('commentsCount');
        const likesEl = document.getElementById('likesCount');
        const runtimeEl = document.getElementById('runtime');
        if (commentsEl) commentsEl.textContent = this.stats.comments || 0;
        if (likesEl) likesEl.textContent = this.stats.likes || 0;
        const progress = this.stats.progress || 0;
        try {
            this.updateProgress(progress);
        } catch (_) {}
        
        if (this.stats.startTime && runtimeEl) {
            const elapsed = Date.now() - this.stats.startTime;
            runtimeEl.textContent = this.formatTime(elapsed);
        }
    }

    updateKeywordDisplay() {
        const keywordStatus = document.getElementById('keywordStatus');
        if (keywordStatus) {
            if (this.keywordSearchActive && this.keywordInfo.currentKeyword) {
                keywordStatus.style.display = 'block';
                keywordStatus.innerHTML = `
                    <div class="keyword-info">
                        <div class="keyword-current">🔎 Ключевое слово: <strong>${this.keywordInfo.currentKeyword}</strong></div>
                        <div class="keyword-progress">${this.keywordInfo.currentKeywordIndex + 1} из ${this.keywordInfo.totalKeywords}</div>
                    </div>
                `;
            } else {
                keywordStatus.style.display = 'none';
            }
        }
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    startStatsTimer() {
        setInterval(() => {
            if (this.isRunning && this.stats.startTime) {
                this.updateStatsDisplay();
            }
        }, 1000);

        // Listen for stats updates from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'statsUpdate') {
                this.stats.comments = message.stats.comments || 0;
                this.stats.likes = message.stats.likes || 0;
                this.stats.progress = message.stats.progress || 0;
                

                
                // Update keyword info if available
                if (message.keywordInfo) {
                    this.keywordSearchActive = message.keywordInfo.isActive;
                    this.keywordInfo = {
                        currentKeyword: message.keywordInfo.currentKeyword,
                        currentKeywordIndex: message.keywordInfo.currentKeywordIndex,
                        totalKeywords: message.keywordInfo.totalKeywords
                    };
                    this.isRunning = message.keywordInfo.isRunning;
                }
                
                this.updateStatsDisplay();
                this.updateProgress(message.stats.progress || 0);
                this.updateKeywordDisplay();
                this.updateUI();
                
            } else if (message.type === 'statusUpdate') {
                if (message.status === 'stopped') {
                    this.isRunning = false;
                    this.isPaused = false;
                    this.keywordSearchActive = false;
                    this.updateUI();
                    this.hideProgress();
                }
                
            } else if (message.type === 'keywordSearchStart') {
                this.keywordSearchActive = true;
                this.isRunning = true;
                this.keywordInfo.totalKeywords = message.keywords ? message.keywords.length : 0;
                this.updateKeywordDisplay();
                this.updateUI();
                this.showProgress();
                
            } else if (message.type === 'keywordSearchEnd') {
                this.keywordSearchActive = false;
                if (message.reason !== 'stopped') {
                    this.isRunning = false;
                }
                this.updateUI();
                if (!this.isRunning) {
                    this.hideProgress();
                }
                
            } else if (message.type === 'keywordProgress') {
                this.keywordInfo = {
                    currentKeyword: message.currentKeyword,
                    currentKeywordIndex: message.currentKeywordIndex,
                    totalKeywords: message.totalKeywords
                };
                this.updateKeywordDisplay();
                
            } else if (message.type === 'currentState') {
                // Sync UI with current content script state
                this.isRunning = message.isRunning || false;
                this.isPaused = message.isPaused || false;
                this.keywordSearchActive = message.keywordSearchActive || false;
                
                if (message.stats) {
                    this.stats.comments = message.stats.comments || 0;
                    this.stats.likes = message.stats.likes || 0;
                    this.stats.progress = message.stats.progress || 0;
                }
                
                // Update keyword search setting checkbox if needed
                if (message.settings && message.settings.enableKeywordSearch !== undefined) {
                    const keywordCheckbox = document.getElementById('enableKeywordSearch');
                    if (keywordCheckbox) {
                        keywordCheckbox.checked = message.settings.enableKeywordSearch;
                    }
                }
                
                this.updateStatsDisplay();
                this.updateProgress(this.stats.progress || 0);
                this.updateKeywordDisplay();
                this.updateUI();
            }
        });
    }

    showProgress() {
        document.getElementById('progressContainer').style.display = 'block';
        document.body.style.paddingBottom = '60px';
    }

    hideProgress() {
        document.getElementById('progressContainer').style.display = 'none';
        document.body.style.paddingBottom = '0';
    }

    updateProgress(progress) {
        const maxPosts = parseInt(document.getElementById('maxPosts').value);
        const percentage = Math.min((progress / maxPosts) * 100, 100);
        
        document.getElementById('progressFill').style.width = percentage + '%';
        document.getElementById('progressText').textContent = `${progress} / ${maxPosts}`;
    }

    showWarning(message) {
        // Create and show warning notification
        const warning = document.createElement('div');
        warning.className = 'warning-notification';
        warning.textContent = message;
        warning.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #ffc107;
            color: #856404;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 3000);
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'error-notification';
        error.textContent = message;
        error.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc3545;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(error);
        
        setTimeout(() => {
            if (error.parentNode) {
                error.parentNode.removeChild(error);
            }
        }, 5000);
    }

    disableControls() {
        document.getElementById('startBtn').disabled = true;
    }

    enableControls() {
        if (!this.isRunning) {
            document.getElementById('startBtn').disabled = false;
        }
    }

    openAdvancedSettings() {
        // Open advanced settings page
        chrome.tabs.create({
            url: chrome.runtime.getURL('settings.html')
        });
    }

    async exportSettings() {
        try {
            const settings = await chrome.storage.sync.get();
            const blob = new Blob([JSON.stringify(settings, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'threadsai-settings.json';
            a.click();
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting settings:', error);
            this.showError('Ошибка экспорта настроек');
        }
    }

    async toggleAISettings(enabled) {
        const aiQuickSettings = document.getElementById('aiQuickSettings');
        
        if (enabled) {
            aiQuickSettings.style.display = 'block';
            // Initialize provider settings when AI is enabled
            await this.toggleProviderSettings(document.getElementById('aiProvider').value);
        } else {
            aiQuickSettings.style.display = 'none';
        }
    }

    async toggleProviderSettings(provider) {
        // Save current settings before switching providers
        await this.saveSettings();
        
        const openaiSettings = document.getElementById('openaiSettings');
        const openrouterSettings = document.getElementById('openrouterSettings');
        const groqSettings = document.getElementById('groqSettings');
        const geminiSettings = document.getElementById('geminiSettings');
        
        // Hide all settings first
        openaiSettings.style.display = 'none';
        openrouterSettings.style.display = 'none';
        groqSettings.style.display = 'none';
        geminiSettings.style.display = 'none';
        
        // Show selected provider settings
        if (provider === 'openai') {
            openaiSettings.style.display = 'block';
        } else if (provider === 'openrouter') {
            openrouterSettings.style.display = 'block';
        } else if (provider === 'groq') {
            groqSettings.style.display = 'block';
        } else if (provider === 'gemini') {
            geminiSettings.style.display = 'block';
        }
        
        // Update status for current provider
        let currentApiKey = '';
        if (provider === 'openai') {
            currentApiKey = document.getElementById('openaiApiKey').value;
        } else if (provider === 'openrouter') {
            currentApiKey = document.getElementById('openrouterApiKey').value;
        } else if (provider === 'groq') {
            currentApiKey = document.getElementById('groqApiKey').value;
        } else if (provider === 'gemini') {
            currentApiKey = document.getElementById('geminiApiKey').value;
        }
            
        this.updateAIStatus('default', currentApiKey ? this.t('apiKeySaved') : this.t('enterApiKey'));
        this.updateApiKeyVisual(currentApiKey ? 'valid' : 'default');
    }

    toggleGroqCustomModel(model) {
        const groqCustomModelInput = document.getElementById('groqCustomModelInput');
        if (model === 'custom') {
            groqCustomModelInput.style.display = 'block';
        } else {
            groqCustomModelInput.style.display = 'none';
        }
    }

    toggleGeminiCustomModel(model) {
        const geminiCustomModelInput = document.getElementById('geminiCustomModelInput');
        if (model === 'custom') {
            geminiCustomModelInput.style.display = 'block';
        } else {
            geminiCustomModelInput.style.display = 'none';
        }
    }

    async testApiKey() {
        const provider = document.getElementById('aiProvider').value;
        const testBtn = event.target; // Get the specific button that was clicked
        const aiStatus = document.getElementById('aiStatus');
        
        // Get the correct API key based on provider
        let apiKeyInput;
        if (provider === 'openai') {
            apiKeyInput = document.getElementById('openaiApiKey');
        } else if (provider === 'openrouter') {
            apiKeyInput = document.getElementById('openrouterApiKey');
        } else if (provider === 'groq') {
            apiKeyInput = document.getElementById('groqApiKey');
        } else if (provider === 'gemini') {
            apiKeyInput = document.getElementById('geminiApiKey');
        }
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            this.updateAIStatus('error', this.t('enterApiKey'));
            this.updateApiKeyVisual('error');
            return;
        }

        // Update UI to show testing state
        testBtn.disabled = true;
        testBtn.textContent = 'Тестирую...';
        this.updateAIStatus('testing', 'Проверка соединения...');
        this.updateApiKeyVisual('testing');

        try {
            let response;
            
            if (provider === 'openai') {
                response = await fetch('https://api.openai.com/v1/models', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else if (provider === 'openrouter') {
                response = await fetch('https://openrouter.ai/api/v1/models', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else if (provider === 'groq') {
                response = await fetch('https://api.groq.com/openai/v1/models', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else if (provider === 'gemini') {
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            if (response.ok) {
                this.updateAIStatus('success', 'API ключ работает ✓');
                this.updateApiKeyVisual('valid');
                // Save validation state for sync between windows
                await this.saveApiKeyValidationState(provider, apiKey, true);
                // Save settings if test successful
                await this.saveSettings();
            } else {
                const errorData = await response.json().catch(() => ({}));
                this.updateAIStatus('error', `Ошибка: ${response.status} ${errorData.error?.message || 'Неверный ключ'}`);
                this.updateApiKeyVisual('error');
            }
        } catch (error) {
            console.error('API test error:', error);
            this.updateAIStatus('error', 'Ошибка сети или неверный ключ');
            this.updateApiKeyVisual('error');
        } finally {
            // Reset button state
            testBtn.disabled = false;
            testBtn.textContent = 'Тест';
        }
    }

    updateAIStatus(type, message) {
        const aiStatus = document.getElementById('aiStatus');
        const statusIndicator = aiStatus.querySelector('.status-indicator');
        const statusText = aiStatus.querySelector('span:last-child');

        // Update indicator color
        statusIndicator.style.background = {
            'success': '#1a7f37',
            'error': '#cf222e', 
            'testing': '#fb8500',
            'default': '#6c757d'
        }[type] || '#6c757d';

        // Update text
        statusText.textContent = message;

        // Auto-hide success/error messages after 3 seconds
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                if (statusText.textContent === message) {
                    this.updateAIStatus('default', this.t('enterApiKey'));
                }
            }, 3000);
        }
    }

    updateApiKeyVisual(state) {
        const provider = document.getElementById('aiProvider').value;
        const apiKeyInput = provider === 'openai' ? 
            document.getElementById('openaiApiKey') : 
            provider === 'openrouter' ? 
            document.getElementById('openrouterApiKey') :
            document.getElementById('groqApiKey');

        // Remove all state classes
        apiKeyInput.classList.remove('valid', 'error', 'testing');

        // Add appropriate class
        if (state === 'valid') {
            apiKeyInput.classList.add('valid');
        } else if (state === 'error') {
            apiKeyInput.classList.add('error');
        }
        // 'testing' and 'default' don't need special classes
    }

    // API Key Validation Methods for Popup
    setupApiKeyValidation() {
        const apiInputs = [
            { id: 'openaiApiKey', provider: 'openai' },
            { id: 'openrouterApiKey', provider: 'openrouter' },
            { id: 'groqApiKey', provider: 'groq' },
            { id: 'geminiApiKey', provider: 'gemini' }
        ];

        apiInputs.forEach(({ id, provider }) => {
            const input = document.getElementById(id);
            if (input) {
                let validationTimeout;
                
                input.addEventListener('input', (e) => {
                    clearTimeout(validationTimeout);
                    const apiKey = e.target.value.trim();
                    
                    if (apiKey.length === 0) {
                        this.clearValidationState(id);
                        return;
                    }
                    
                    // Show validating state
                    this.setValidationState(id, 'validating', '⏳', 'Проверка ключа...');
                    
                    // Debounce validation
                    validationTimeout = setTimeout(() => {
                        this.validateApiKey(apiKey, provider, id);
                    }, 1000);
                });
            }
        });
    }

    async validateApiKey(apiKey, provider, inputId) {
        try {
            let isValid = false;
            let message = '';

            switch (provider) {
                case 'openai':
                    if (apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-')) {
                        isValid = await this.testOpenAIKey(apiKey);
                        message = isValid ? 'Ключ OpenAI валиден' : 'Неверный ключ OpenAI';
                    } else {
                        message = 'Ключ должен начинаться с sk-proj- или sk-';
                    }
                    break;
                    
                case 'openrouter':
                    if (apiKey.startsWith('sk-or-v1-')) {
                        isValid = await this.testOpenRouterKey(apiKey);
                        message = isValid ? 'Ключ OpenRouter валиден' : 'Неверный ключ OpenRouter';
                    } else {
                        message = 'Ключ должен начинаться с sk-or-v1-';
                    }
                    break;
                    
                case 'groq':
                    if (apiKey.startsWith('gsk_')) {
                        isValid = await this.testGroqKey(apiKey);
                        message = isValid ? 'Ключ Groq валиден' : 'Неверный ключ Groq';
                    } else {
                        message = 'Ключ должен начинаться с gsk_';
                    }
                    break;
                    
                case 'gemini':
                    if (apiKey.startsWith('AIza')) {
                        isValid = await this.testGeminiKey(apiKey);
                        message = isValid ? 'Ключ Gemini валиден' : 'Неверный ключ Gemini';
                    } else {
                        message = 'Ключ должен начинаться с AIza';
                    }
                    break;
            }

            const icon = isValid ? '✅' : '❌';
            const state = isValid ? 'valid' : 'invalid';
            this.setValidationState(inputId, state, icon, message);
            
            // Save validation state to storage for sync between windows
            if (isValid) {
                await this.saveApiKeyValidationState(provider, apiKey, true);
            }
            
        } catch (error) {
            console.error('API validation error:', error);
            this.setValidationState(inputId, 'invalid', '❌', 'Ошибка проверки ключа');
        }
    }

    async testOpenAIKey(apiKey) {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async testOpenRouterKey(apiKey) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async testGroqKey(apiKey) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async testGeminiKey(apiKey) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    setValidationState(inputId, state, icon, message) {
        const input = document.getElementById(inputId);
        const statusElement = document.getElementById(inputId + 'Status');
        const messageElement = document.getElementById(inputId + 'Message');
        const container = input?.parentElement;

        if (input && statusElement && messageElement && container) {
            // Clear previous states
            container.classList.remove('valid', 'invalid', 'validating');
            input.classList.remove('valid', 'invalid', 'validating');
            
            // Set new state
            container.classList.add(state);
            input.classList.add(state);
            statusElement.textContent = icon;
            messageElement.textContent = message;
            messageElement.className = `validation-message ${state === 'valid' ? 'success' : state === 'invalid' ? 'error' : 'info'}`;
            messageElement.style.display = 'block';
        }
    }

    clearValidationState(inputId) {
        const input = document.getElementById(inputId);
        const statusElement = document.getElementById(inputId + 'Status');
        const messageElement = document.getElementById(inputId + 'Message');
        const container = input?.parentElement;

        if (input && statusElement && messageElement && container) {
            container.classList.remove('valid', 'invalid', 'validating');
            input.classList.remove('valid', 'invalid', 'validating');
            statusElement.textContent = '';
            messageElement.style.display = 'none';
        }
    }

    // Save API key validation state to storage
    async saveApiKeyValidationState(provider, apiKey, isValid) {
        try {
            const validationKey = `${provider}ApiKeyValidated`;
            const validationData = {
                [validationKey]: {
                    isValid: isValid,
                    apiKey: apiKey,
                    timestamp: Date.now()
                }
            };
            await chrome.storage.local.set(validationData);
            console.log(`💾 Saved ${provider} API key validation state`);
        } catch (error) {
            console.error('Error saving API key validation state:', error);
        }
    }

    // Load and apply saved validation states
    async loadApiKeyValidationStates() {
        try {
            const providers = ['openai', 'openrouter', 'groq'];
            const validationData = await chrome.storage.local.get(
                providers.map(p => `${p}ApiKeyValidated`)
            );

            for (const provider of providers) {
                const validationKey = `${provider}ApiKeyValidated`;
                const savedState = validationData[validationKey];
                
                if (savedState && savedState.isValid) {
                    const inputId = `${provider}ApiKey`;
                    const input = document.getElementById(inputId);
                    
                    if (input && input.value === savedState.apiKey) {
                        // Check if validation is not too old (24 hours)
                        const isRecent = (Date.now() - savedState.timestamp) < 24 * 60 * 60 * 1000;
                        
                        if (isRecent) {
                            this.setValidationState(inputId, 'valid', '✅', `Ключ ${provider} валиден`);
                            console.log(`✅ Applied saved validation state for ${provider}`);
                        } else {
                            // Clear old validation state
                            await chrome.storage.local.remove(validationKey);
                            console.log(`🗑️ Cleared old validation state for ${provider}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading API key validation states:', error);
        }
    }








}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThreadsAIPopup();
});