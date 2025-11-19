// ThreadsAI Content Script - работает на threads.net

// Content Script Translations
const contentTranslations = {
    en: {
        // Panel titles
        quickSettings: "Quick Settings",
        quickActions: "⚡ Quick Actions",
        
        // Buttons
        startBtn: "Start",
        pauseBtn: "Pause", 
        stopBtn: "Stop",
        likeBtn: "Like",
        commentBtn: "Comment",
        settingsBtn: "Settings",
        
        // Status
        stopped: "Stopped",
        running: "Running",
        paused: "Paused",
        
        // Log
        logEmpty: "Log is empty",
        panelInitialized: "Bottom panel initialized",
        
        // Other
        posts: "Posts",
        delay: "Delay", 
        actionsPerHour: "Actions/hour",
        save: "💾 Save",
        fullSettings: "⚙️ Full Settings",
        
        // Filter labels
        autoLikes: "❤️ Auto Likes",
        stealthMode: "🥷 Stealth Mode", 
        filters: "🔍 Filters",
        postsFilter: "Posts",
        languagesFilter: "Languages",
        usersFilter: "Users", 
        duplicatesFilter: "Duplicate Posts",
        uniqueUsers: "Unique Users",
        
        // Notifications
        settingsClosed: "Settings closed",
        settingsOpened: "Settings opened", 
        fullSettingsOpened: "Full settings opened in new tab",
        settingsSaveError: "Error saving settings",
        started: "ThreadsAI started! 🚀",
        pausedNotif: "ThreadsAI paused ⏸️",
        resumedNotif: "ThreadsAI resumed ▶️",
        stoppedNotif: "ThreadsAI stopped ⏹️",
        limitReached: "Reached limit of {count} posts! Stopping...",
        noKeywords: "No keywords to search",
        keywordSearchError: "Keyword search error",
        keywordSearchResumed: "Keyword search resumed after reload",
        keywordSearchAutoStarted: "Keyword search started automatically!",
        keywordAutoStartError: "Keyword search auto-start error",
        needStart: "Start automation first",
        alreadyStopped: "Automation already stopped",
        likeSuccess: "Like added!",
        likeFailed: "Failed to like",
        postsNotFound: "Posts not found",
        commentAdded: "Comment added!",
        commentFailed: "Failed to add comment",
        commentError: "Comment error",
        likeError: "Like error",
        openSettingsError: "Error opening settings",
        panelNotFound: "Panel not found",
        clickExtensionIconForSettings: "Click the extension icon for full settings",
        settingsSaved: "Settings saved!",
        keywordSearchFinished: "Keyword search finished",
        aiKeyMissing: "AI is enabled but API key is missing. Enter API key in settings.",
        
        // Log messages
        quickLikeAdded: "❤️ Quick like added",
        quickCommentAdded: "💬 Quick comment added",
        totalStats: "📊 Total: Processed {processed} | Filtered {filtered}",
        postsFiltered: "📊 Posts filtered: {count}",
        postsProcessed: "✅ Posts processed: {count}"
    },
    ru: {
        // Panel titles
        quickSettings: "Быстрые настройки",
        quickActions: "⚡ Быстрые действия",
        
        // Buttons
        startBtn: "Запустить",
        pauseBtn: "Пауза",
        stopBtn: "Стоп", 
        likeBtn: "Лайк",
        commentBtn: "Коммент",
        settingsBtn: "Настройки",
        
        // Status
        stopped: "Остановлено",
        running: "Работает",
        paused: "Приостановлено",
        
        // Log
        logEmpty: "Лог пуст",
        panelInitialized: "Нижняя панель инициализирована",
        
        // Other
        posts: "Постов",
        delay: "Задержка",
        actionsPerHour: "Действий/час",
        save: "💾 Сохранить", 
        fullSettings: "⚙️ Полные настройки",
        
        // Filter labels
        autoLikes: "❤️ Автолайки",
        stealthMode: "🥷 Скрытный режим", 
        filters: "🔍 Фильтры",
        postsFilter: "Посты",
        languagesFilter: "Языки",
        usersFilter: "Пользователи", 
        duplicatesFilter: "Дубликаты постов",
        uniqueUsers: "Уникальные пользователи",
        
        // Notifications
        settingsClosed: "Настройки закрыты",
        settingsOpened: "Настройки открыты", 
        fullSettingsOpened: "Полные настройки открыты в новой вкладке",
        settingsSaveError: "Ошибка сохранения настроек",
        started: "ThreadsAI запущен! 🚀",
        pausedNotif: "ThreadsAI приостановлен ⏸️",
        resumedNotif: "ThreadsAI возобновлен ▶️",
        stoppedNotif: "ThreadsAI остановлен ⏹️",
        limitReached: "Достигнут лимит {count} постов! Останавливаем...",
        noKeywords: "Нет ключевых слов для поиска",
        keywordSearchError: "Ошибка поиска по ключевым словам",
        keywordSearchResumed: "🔎 Поиск по ключевым словам продолжен после перезагрузки",
        keywordSearchAutoStarted: "🔎 Поиск по ключевым словам запущен автоматически!",
        keywordAutoStartError: "Ошибка автозапуска поиска по ключевым словам",
        needStart: "Сначала запустите автоматизацию",
        alreadyStopped: "Автоматизация уже остановлена",
        likeSuccess: "Лайк поставлен!",
        likeFailed: "Не удалось поставить лайк",
        postsNotFound: "Посты не найдены",
        commentAdded: "Комментарий добавлен!",
        commentFailed: "Не удалось добавить комментарий",
        commentError: "Ошибка комментария",
        likeError: "Ошибка лайка",
        openSettingsError: "Ошибка открытия настроек",
        panelNotFound: "Панель не найдена",
        clickExtensionIconForSettings: "Нажмите на иконку расширения для полных настроек",
        settingsSaved: "Настройки сохранены!",
        keywordSearchFinished: "Поиск по ключевым словам завершен",
        aiKeyMissing: "Включена генерация ИИ, но API ключ не указан. Введите ключ в настройках.",
        
        // Log messages
        quickLikeAdded: "❤️ Быстрый лайк поставлен",
        quickCommentAdded: "💬 Быстрый комментарий добавлен",
        totalStats: "📊 Итого: Обработано {processed} | Отфильтровано {filtered}",
        postsFiltered: "📊 Отфильтровано постов: {count}",
        postsProcessed: "✅ Обработано постов: {count}"
    }
};

class ThreadsAIContentScript {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentLanguage = 'ru'; // Default language
        this.settings = {};
        this.stats = {
            comments: 0,
            likes: 0,
            progress: 0
        };
        
        this.actionQueue = [];
        this.lastActionTime = 0;
        this.actionTimestamps = []; // legacy: total actions
        this.commentTimestamps = [];
        this.likeTimestamps = [];
        this.processedPosts = new Set();
        this.currentlyProcessingPosts = new Set();
        this.isProcessingKeywordSearch = false;
        // First-comment mode (первонах) state
        this.firstCommentIgnoreSet = new Set();
        this.isFirstCommentMode = false;
        // Ignored users state
        this.ignoredUsersSet = new Set();
        this.activityLog = [];
        this.panelInitialized = false;
        this.logFrameInitialized = false;
        this.bottomPanelInitialized = false;
        this.scrollAttempts = 0;
        this.consecutiveFilteredPosts = 0;
        this.filteredPostsInCurrentLoop = new Set();
        this.lastPagePostCount = 0;
        this.noNewPostsCount = 0;
        this.totalFilteredCount = 0;
        this.totalProcessedCount = 0;
        
        this.init();
        // === UNIVERSAL COMMENT WINDOW OBSERVER ===
        // this._initCommentWindowObserver(); // Временно отключено из-за ошибки
    }

    recordActionTimestamp(type = 'any') {
        try {
            const now = Date.now();
            const windowMs = 60 * 60 * 1000;
            this.actionTimestamps = Array.isArray(this.actionTimestamps) ? this.actionTimestamps : [];
            this.commentTimestamps = Array.isArray(this.commentTimestamps) ? this.commentTimestamps : [];
            this.likeTimestamps = Array.isArray(this.likeTimestamps) ? this.likeTimestamps : [];
            // Clean old entries
            while (this.actionTimestamps.length && (now - this.actionTimestamps[0]) > windowMs) {
                this.actionTimestamps.shift();
            }
            this.actionTimestamps.push(now);
            // Per-action arrays
            if (type === 'comment') {
                while (this.commentTimestamps.length && (now - this.commentTimestamps[0]) > windowMs) {
                    this.commentTimestamps.shift();
                }
                this.commentTimestamps.push(now);
            } else if (type === 'like') {
                while (this.likeTimestamps.length && (now - this.likeTimestamps[0]) > windowMs) {
                    this.likeTimestamps.shift();
                }
                this.likeTimestamps.push(now);
            }
            // Persist timestamps for cross-hour continuity
            try {
                chrome.storage.local.set({
                    actionTimestamps: this.actionTimestamps,
                    commentTimestamps: this.commentTimestamps,
                    likeTimestamps: this.likeTimestamps,
                    lastActionAt: now
                });
            } catch (e) {
                console.warn('Could not persist action timestamps:', e);
            }
        } catch (error) {
            console.error('Error recording action timestamp:', error);
        }
    }

    // Translation helper
    t(key) {
        return contentTranslations[this.currentLanguage][key] || contentTranslations['ru'][key] || key;
    }

    // Load language from storage
    async loadLanguage() {
        try {
            const result = await chrome.storage.sync.get(['language']);
            this.currentLanguage = result.language || 'ru';
        } catch (error) {
            console.error('Error loading language:', error);
            this.currentLanguage = 'ru';
        }
    }

    // Update content script language
    updateContentLanguage() {
        // Update bottom panel if it exists
        if (this.bottomPanel) {
            // Update quick actions header
            const quickActionsHeader = this.bottomPanel.querySelector('.quick-actions-header');
            if (quickActionsHeader) {
                quickActionsHeader.textContent = this.t('quickActions');
            }
            
            // Update action buttons text
            const actionButtons = this.bottomPanel.querySelectorAll('.action-text');
            const actionKeys = ['startBtn', 'pauseBtn', 'stopBtn', 'likeBtn', 'commentBtn'];
            actionButtons.forEach((btn, index) => {
                if (actionKeys[index]) {
                    btn.textContent = this.t(actionKeys[index]);
                }
            });
            
            // Update settings button
            const settingsBtn = this.bottomPanel.querySelector('#bottom-settings-btn');
            if (settingsBtn) {
                settingsBtn.textContent = `⚙️ ${this.t('settingsBtn')}`;
            }
            
            // Update log empty message
            const logEmpty = this.bottomPanel.querySelector('.log-empty');
            if (logEmpty) {
                logEmpty.textContent = this.t('logEmpty');
            }
        }
        
        // Update inline settings if open
        this.updateInlineSettingsLanguage();
    }

    // Update inline settings language
    updateInlineSettingsLanguage() {
        const inlineSettings = this.bottomPanel?.querySelector('.inline-settings');
        if (inlineSettings) {
            // Update header
            const header = inlineSettings.querySelector('.qs-header h3');
            if (header) {
                header.textContent = this.t('quickSettings');
            }
            
            // Update labels
            const labels = inlineSettings.querySelectorAll('.qs-compact label');
            const labelKeys = ['posts', 'delay', 'actionsPerHour'];
            labels.forEach((label, index) => {
                if (labelKeys[index]) {
                    label.textContent = this.t(labelKeys[index]);
                }
            });
            
            // Update save button
            const saveBtn = inlineSettings.querySelector('.save-quick-settings');
            if (saveBtn) {
                saveBtn.textContent = this.t('save');
            }
            
            // Update full settings button
            const fullBtn = inlineSettings.querySelector('.open-full-settings');
            if (fullBtn) {
                fullBtn.textContent = this.t('fullSettings');
            }
        }
    }

    init() {
        console.log('ThreadsAI Content Script initialized on', window.location.href);
        
        // Check if we're on the right domain
        const isValidDomain = window.location.hostname.includes('threads.net') || 
                             window.location.hostname.includes('threads.com');
        
        if (!isValidDomain) {
            console.warn('ThreadsAI: Not on Threads domain');
            return;
        }
        
        console.log('ThreadsAI: Valid Threads domain detected');
        
        // Load language first
        this.loadLanguage();
        
        // Initialize UI
        this.injectStyles();
        this.createBottomPanel();
        // Load persisted stats so page refresh doesn't zero counters
        this.loadPersistentStats?.();
        
        // Load rate-limit state
        this.loadRateLimitState?.();

        // Check if we need to resume keyword search after page reload
        this.checkAndResumeKeywordSearch();

        // Load persistent ignore list for first-comment mode
        this.loadFirstCommentIgnoreList();
        this.loadIgnoredUsersList();
        
        // Add debug function to window for manual analysis
        window.debugThreadsAI = () => {
            console.log('=== THREADS.COM ELEMENT ANALYSIS ===');
            
            // Find all elements that might be posts
            const postCandidates = document.querySelectorAll('[data-pressable-container="true"]');
            console.log(`Found ${postCandidates.length} post candidates`);
            
            if (postCandidates.length > 0) {
                const firstPost = postCandidates[0];
                console.log('Analyzing first post:');
                console.log('HTML:', firstPost.outerHTML.substring(0, 1000));
                
                // Find all interactive elements
                const interactive = firstPost.querySelectorAll('[role="button"], button, [tabindex], [aria-label], [title]');
                console.log(`Interactive elements in first post: ${interactive.length}`);
                
                interactive.forEach((el, i) => {
                    console.log(`${i}: ${el.tagName} role="${el.getAttribute('role')}" aria-label="${el.getAttribute('aria-label')}" title="${el.getAttribute('title')}" text="${el.textContent?.substring(0, 30)}"`);
                });
            }
        };
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep the message channel open for async responses
        });

        // Apply initial theme
        this.applyTheme();

        // Inject custom styles
        this.injectStyles();
        
        // Create UI
        this.createBottomPanel();
        
        // Monitor page changes (SPA navigation)
        this.observePageChanges();
    }

    // Load persisted rate-limit timestamps and next resume time
    async loadRateLimitState() {
        try {
            const { actionTimestamps, commentTimestamps, likeTimestamps, rateLimitResumeAt } = await chrome.storage.local.get([
                'actionTimestamps', 'commentTimestamps', 'likeTimestamps', 'rateLimitResumeAt'
            ]);
            const now = Date.now();
            const windowMs = 60 * 60 * 1000;
            const clean = (arr) => (Array.isArray(arr) ? arr.filter(ts => (now - ts) <= windowMs).sort((a,b)=>a-b) : []);
            this.actionTimestamps = clean(actionTimestamps);
            this.commentTimestamps = clean(commentTimestamps);
            this.likeTimestamps = clean(likeTimestamps);
            this.rateLimitResumeAt = typeof rateLimitResumeAt === 'number' ? rateLimitResumeAt : null;
        } catch (e) {
            console.warn('Could not load rate limit state:', e);
        }
    }

    async loadPersistentStats() {
        try {
            const { persistentStats } = await chrome.storage.local.get(['persistentStats']);
            if (persistentStats && persistentStats.stats) {
                const saved = persistentStats.stats;
                if (typeof saved.comments === 'number' || typeof saved.likes === 'number' || typeof saved.progress === 'number') {
                    this.stats = {
                        comments: saved.comments || 0,
                        likes: saved.likes || 0,
                        progress: saved.progress || 0,
                        startTime: this.stats?.startTime || Date.now()
                    };
                    this.updateBottomPanelDisplay?.();
                    this.sendStatsUpdate?.();
                    console.log('📊 Restored stats from storage:', this.stats);
                }
            }
        } catch (e) {
            console.warn('Could not load persistent stats:', e);
        }
    }

    // ===================== First-Comment (Первонах) helpers =====================
    async loadFirstCommentIgnoreList() {
        try {
            const { firstCommentIgnoreList } = await chrome.storage.local.get(['firstCommentIgnoreList']);
            const list = Array.isArray(firstCommentIgnoreList) ? firstCommentIgnoreList : [];
            this.firstCommentIgnoreSet = new Set(list);
            console.log(`🧾 Loaded first-comment ignore list: ${list.length} ids`);
        } catch (e) {
            console.error('Error loading first-comment ignore list:', e);
        }
    }

    async saveFirstCommentIgnoreList() {
        try {
            const list = Array.from(this.firstCommentIgnoreSet).slice(-10000); // cap for safety
            await chrome.storage.local.set({ firstCommentIgnoreList: list });
        } catch (e) {
            console.error('Error saving first-comment ignore list:', e);
        }
    }

    hasBeenCommentedBefore(postId) {
        if (!postId) return false;
        return this.firstCommentIgnoreSet.has(postId);
    }

    async markCommented(postId) {
        if (!postId) return;
        this.firstCommentIgnoreSet.add(postId);
        await this.saveFirstCommentIgnoreList();
        console.log(`💾 Added to ignore list: ${postId.substring(0, 10)}...`);
    }

    // ===================== Ignored Users helpers =====================
    async loadIgnoredUsersList() {
        try {
            const { ignoredUsersList } = await chrome.storage.local.get(['ignoredUsersList']);
            const list = Array.isArray(ignoredUsersList) ? ignoredUsersList : [];
            this.ignoredUsersSet = new Set(list);
            console.log(`👥 Loaded ignored users list: ${list.length} users`);
        } catch (e) {
            console.error('Error loading ignored users list:', e);
        }
    }

    async saveIgnoredUsersList() {
        try {
            const list = Array.from(this.ignoredUsersSet).slice(-5000); // cap for safety
            await chrome.storage.local.set({ ignoredUsersList: list });
        } catch (e) {
            console.error('Error saving ignored users list:', e);
        }
    }

    isUserIgnored(username) {
        if (!username) return false;
        return this.ignoredUsersSet.has(username);
    }

    async markUserIgnored(username) {
        if (!username) return;
        this.ignoredUsersSet.add(username);
        await this.saveIgnoredUsersList();
        console.log(`👥 Added user to ignore list: ${username}`);
    }

    // Theme Management
    async applyTheme() {
        try {
            const result = await chrome.storage.sync.get(['appliedTheme']);
            const theme = result.appliedTheme || 'light';
            document.body.setAttribute('data-theme', theme);
            console.log(`🎨 Applied theme to content: ${theme}`);
        } catch (error) {
            console.log('Could not apply theme, using default');
            document.body.setAttribute('data-theme', 'light');
        }
    }

    handleMessage(message, sender, sendResponse) {
        try {
        switch (message.action) {
            case 'themeChanged':
                document.body.setAttribute('data-theme', message.theme);
                console.log(`🎨 Theme changed to: ${message.theme}`);
                sendResponse({ success: true });
                break;
                
            case 'languageChanged':
                this.currentLanguage = message.language;
                this.updateContentLanguage();
                console.log(`🌐 Language changed to: ${message.language}`);
                sendResponse({ success: true });
                break;
                
            case 'ping':
                // Response to ping - content script is ready
                console.log('📡 Content script received ping, responding...');
                sendResponse({ success: true, ready: true });
                break;
                
            case 'start':
                this.start(message.settings);
                sendResponse({ success: true });
                break;
                
            case 'pause':
                this.pause();
                sendResponse({ success: true });
                break;
                
            case 'stop':
                this.stop();
                sendResponse({ success: true });
                break;
                
            case 'checkKeywordSearchResume':
                // Background script is asking if we should resume keyword search
                console.log('📨 Background script asking about keyword search resume');
                this.checkAndResumeKeywordSearch();
                sendResponse({ success: true });
                break;
                
                case 'getState':
                    // Popup is requesting current state
                    console.log('📡 Popup requesting current state');
                    this.sendCurrentState();
                sendResponse({ success: true });
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            if (sendResponse) {
                sendResponse({ success: false, error: error.message });
            }
        }
    }

    async start(settings) {
        this.settings = settings;
        this.isRunning = true;
        this.isPaused = false;
        // Preserve existing counters if present; set startTime if missing
        const existing = this.stats || {};
        this.stats = {
            comments: typeof existing.comments === 'number' ? existing.comments : 0,
            likes: typeof existing.likes === 'number' ? existing.likes : 0,
            progress: 0, // Reset progress for new session
            startTime: Date.now() // Reset start time for new session
        };
        // Restore persisted timestamps to respect hourly limits across restarts
        try {
            const { actionTimestamps, commentTimestamps, likeTimestamps } = await chrome.storage.local.get(['actionTimestamps','commentTimestamps','likeTimestamps']);
            const now = Date.now();
            const windowMs = 60 * 60 * 1000;
            const clean = (arr) => (Array.isArray(arr) ? arr.filter(ts => (now - ts) <= windowMs).sort((a,b)=>a-b) : []);
            this.actionTimestamps = clean(actionTimestamps);
            this.commentTimestamps = clean(commentTimestamps);
            this.likeTimestamps = clean(likeTimestamps);
        } catch (e) {
            this.actionTimestamps = [];
            this.commentTimestamps = [];
            this.likeTimestamps = [];
        }
        
        // Reset counters on start
        this.scrollAttempts = 0;
        this.consecutiveFilteredPosts = 0;
        this.filteredPostsInCurrentLoop.clear();
        this.lastPagePostCount = 0;
        this.noNewPostsCount = 0;
        this.totalFilteredCount = 0;
        this.totalProcessedCount = 0;
        
        // Persist stats snapshot on start
        try { chrome.storage.local.set({ persistentStats: { stats: this.stats, savedAt: Date.now() } }); } catch (_) {}
        console.log('ThreadsAI started with settings:', settings);
        console.log(`📊 Session progress reset: 0/${this.settings.maxPosts} posts`);
        this.addLogItem('🚀 ThreadsAI запущен (новая сессия)', 'success');
        
        this.updateBottomPanelDisplay();
        this.updateQuickActionStates();
        this.showNotification(this.t('started'), 'success');
        
        // Choose automation mode
        if (this.settings.enableKeywordSearch) {
            console.log('🔎 Starting keyword search mode');
            this.startKeywordSearchMode();
        } else {
            console.log('📄 Starting standard feed mode');
            this.startAutomationLoop();
        }
    }

    pause() {
        this.isPaused = !this.isPaused;
        console.log('ThreadsAI paused:', this.isPaused);
        
        this.updateBottomPanelDisplay();
        this.updateQuickActionStates();
        this.addLogItem(
            this.isPaused ? '⏸️ ThreadsAI приостановлен' : '▶️ ThreadsAI возобновлен',
            this.isPaused ? 'warning' : 'info'
        );
        this.showNotification(
            this.isPaused ? this.t('pausedNotif') : this.t('resumedNotif'),
            'info'
        );
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        this.actionQueue = [];
        this.actionTimestamps = [];
        
        // Reset counters
        this.scrollAttempts = 0;
        this.consecutiveFilteredPosts = 0;
        this.filteredPostsInCurrentLoop.clear();
        this.lastPagePostCount = 0;
        this.noNewPostsCount = 0;
        this.totalFilteredCount = 0;
        this.totalProcessedCount = 0;
        
        console.log('ThreadsAI stopped');
        this.addLogItem('⏹️ ThreadsAI остановлен', 'warning');
        
        // Add final statistics
        if (this.totalProcessedCount > 0 || this.totalFilteredCount > 0) {
            this.addLogItem(this.t('totalStats').replace('{processed}', this.totalProcessedCount).replace('{filtered}', this.totalFilteredCount), 'info');
        }
        
        // Clear keyword search state when stopping
        this.clearKeywordSearchState();
        
        this.updateBottomPanelDisplay();
        this.updateQuickActionStates();
        this.showNotification(this.t('stoppedNotif'), 'warning');
        
        // Send status update to popup
        chrome.runtime.sendMessage({
            type: 'statusUpdate',
            status: 'stopped'
        });
        
        // Also send keyword search end if it was running
        chrome.runtime.sendMessage({
            type: 'keywordSearchEnd',
            reason: 'stopped'
        });
    }

    async startAutomationLoop() {
        while (this.isRunning) {
            if (!this.isPaused) {
                try {
                    await this.processPage();
                    
                    // Check if stopped during processPage (e.g., due to limit)
                    if (!this.isRunning) {
                        console.log('⏹️ Automation stopped during page processing');
                        break;
                    }
                    
                } catch (error) {
                    console.error('Error in automation loop:', error);
                    this.showNotification((this.t && this.t('automationError')) || ('Ошибка автоматизации: ' + error.message), 'error');
                }
            }
            
            // Wait before next iteration
            const delay = this.getRandomDelay();
            console.log(`Waiting ${delay}ms before next action...`);
            await this.loggedSleep(delay, 'между действиями');
        }
    }
    async processPage() {
        try {
            // Check if stopped before processing
            if (!this.isRunning) {
                console.log('⏹️ processPage: Already stopped, exiting');
                return;
            }
            
            // Find feed posts
            const posts = this.findPosts();
            console.log(`Found ${posts.length} posts on page`);
            
            if (posts.length === 0) {
                console.log('No posts found, scrolling to load more...');
                if (this.isRunning) { // Only scroll if still running
                    await this.scrollToLoadMore();
                }
                return;
            }
            
            // Check if new posts loaded after scroll
            if (this.lastPagePostCount === posts.length && this.scrollAttempts > 0) {
                this.noNewPostsCount++;
                console.log(`🔄 No new posts loaded after scroll (${this.noNewPostsCount}/10 attempts)`);
                
                // Only stop if we can't load new posts AND we've already processed all visible posts (including ignored ones)
                const allPostsProcessed = posts.every(post => {
                    const postId = this.getPostId(post);
                    if (this.processedPosts.has(postId)) return true;
                    if (this.settings.avoidDuplicates && this.hasBeenCommentedBefore(postId)) return true;
                    if (this.settings.avoidDuplicateUsers) {
                        const userProfile = this.analyzeUserProfile(post);
                        if (userProfile.username && this.isUserIgnored(userProfile.username)) return true;
                    }
                    return false;
                });
                
                if (this.noNewPostsCount >= 10 && allPostsProcessed) {
                    console.log('🚫 Stopped: No new posts loading and all visible posts processed');
                    this.addLogItem('🚫 Остановлено: Новые посты не загружаются', 'warning');
                    this.stop();
                    return;
                }
            } else {
                this.noNewPostsCount = 0; // Reset if we got new posts
            }
            
            this.lastPagePostCount = posts.length;
            
            for (const post of posts) {
                if (!this.isRunning || this.isPaused) break;
                
                try {
                    const postId = this.getPostId(post);
                    if (this.processedPosts.has(postId)) {
                        console.log(`Post ${postId} already processed, skipping...`);
                        continue;
                    }
                    
                    console.log(`Processing post ${postId}...`);
                    
                    // Skip if already commented before (ignore list) - DON'T count as filtered
                    console.log(`🔍 Checking duplicates for ${postId}: avoidDuplicates=${this.settings.avoidDuplicates}, inIgnoreList=${this.hasBeenCommentedBefore(postId)}`);
                    if (this.settings.avoidDuplicates && this.hasBeenCommentedBefore(postId)) {
                        console.log(`⏭️ Post ${postId} already commented before, skipping`);
                        this.processedPosts.add(postId); // Mark as processed to avoid re-checking
                        continue; // Continue to next post without counting as filtered
                    }

                    // Skip if user is in ignored users list (avoid duplicate users) - DON'T count as filtered
                    if (this.settings.avoidDuplicateUsers) {
                        const userProfile = this.analyzeUserProfile(post);
                        if (userProfile.username && this.isUserIgnored(userProfile.username)) {
                            console.log(`⏭️ Post ${postId} from ignored user ${userProfile.username}, skipping`);
                            this.processedPosts.add(postId); // Mark as processed to avoid re-checking
                            continue; // Continue to next post without counting as filtered
                        }
                    }
                    
                    // Check if post passes all filters before processing
                    if (!this.passesAllFilters(post)) {
                        console.log(`⏭️ Post ${postId} filtered out, skipping...`);
                        this.processedPosts.add(postId); // Mark as processed to avoid re-checking
                        
                        // Only count unique filtered posts (not already counted in this session)
                        if (!this.filteredPostsInCurrentLoop.has(postId)) {
                            this.filteredPostsInCurrentLoop.add(postId);
                            this.consecutiveFilteredPosts++;
                            this.totalFilteredCount++;
                            
                            console.log(`📊 Filtered posts count: ${this.consecutiveFilteredPosts} (unique post ${postId})`);
                            
                            // Add filter counter to log every 10 filtered posts
                            if (this.totalFilteredCount % 10 === 0) {
                                this.addLogItem(this.t('postsFiltered').replace('{count}', this.totalFilteredCount), 'info');
                            }
                            
                            // Check if we've filtered too many posts consecutively
                            const maxFiltered = this.settings?.maxScrollAttempts || 20;
                            if (this.consecutiveFilteredPosts >= maxFiltered) {
                                console.log(`🚫 Stopped: ${maxFiltered} consecutive filtered posts`);
                                this.addLogItem(`🚫 Остановлено: ${maxFiltered} отфильтрованных постов подряд (всего отфильтровано: ${this.totalFilteredCount})`, 'warning');
                                this.stop();
                                return;
                            }
                        }

                        continue;
                    }
                    
                    // Decide what actions to take
                    const actions = this.decideActions();
                    console.log(`Actions chosen: ${actions.join(' + ')}`);
                    
                    let success = false;
                    let successCount = 0;
                    
                    // Execute all actions for this post
                    for (const action of actions) {
                        try {
                            let actionSuccess = false;
                            
                            if (action === 'comment') {
                                console.log('🗨️ Executing comment action...');
                                actionSuccess = await this.postComment(post);
                                if (actionSuccess) {
                                    this.stats.comments++;
                                    try { chrome.storage.local.set({ persistentStats: { stats: this.stats, savedAt: Date.now() } }); } catch (_) {}
                                    this.recordActionTimestamp('comment');
                                    console.log('✅ Comment action completed');
                                    if (!this.canProcessPost()) {
                                        await this.waitForHourlySlot();
                                        break;
                                    }
                                }
                            } else if (action === 'like') {
                                console.log('❤️ Executing like action...');
                                actionSuccess = await this.likePost(post);
                                if (actionSuccess) {
                                    this.stats.likes++;
                                    try { chrome.storage.local.set({ persistentStats: { stats: this.stats, savedAt: Date.now() } }); } catch (_) {}
                                    this.recordActionTimestamp('like');
                                    console.log('✅ Like action completed');
                                    if (!this.canProcessPost()) {
                                        await this.waitForHourlySlot();
                                        break;
                                    }
                                }
                            }
                            
                            if (actionSuccess) {
                                successCount++;
                            }
                            
                            // Small delay between actions on same post
                            if (actions.length > 1 && action !== actions[actions.length - 1]) {
                                console.log('⏳ Brief delay between actions...');
                                await this.loggedSleep(500 + Math.random() * 1000, 'между лайком и комментарием');
                            }
                            
                        } catch (actionError) {
                            console.error(`Error executing ${action} action:`, actionError);
                        }
                    }
                    
                    // Consider successful if at least one action succeeded
                    success = successCount > 0;
                    console.log(`📊 Actions summary: ${successCount}/${actions.length} successful`);
                    
                    if (success) {
                        this.processedPosts.add(postId);
                        this.stats.progress++;
                        try { chrome.storage.local.set({ persistentStats: { stats: this.stats, savedAt: Date.now() } }); } catch (_) {}
                        this.sendStatsUpdate();
                        this.updateBottomPanelDisplay();
                        this.sendStatsUpdate();
                        this.updateBottomPanelDisplay();
                        this.totalProcessedCount++;
                        this.scrollAttempts = 0; // Reset scroll attempts when we successfully process a post
                // Persist to ignore list for first-comment mode
                if (this.settings.avoidDuplicates) {
                    await this.markCommented(postId);
                }
                
                // Add user to ignored users list if enabled
                if (this.settings.avoidDuplicateUsers) {
                    const userProfile = this.analyzeUserProfile(post);
                    if (userProfile.username) {
                        await this.markUserIgnored(userProfile.username);
                    }
                }
                        this.consecutiveFilteredPosts = 0; // Reset filtered posts counter when we successfully process a post
                        this.filteredPostsInCurrentLoop.clear(); // Clear the set of filtered posts for fresh count
                        this.noNewPostsCount = 0; // Reset no new posts counter when we successfully process a post
                        
                        // Log processed counter every 5 posts
                        if (this.totalProcessedCount % 5 === 0) {
                            this.addLogItem(this.t('postsProcessed').replace('{count}', this.totalProcessedCount), 'success');
                        }
                        
                        // Update stats
                        this.sendStatsUpdate();
                        this.updateBottomPanelDisplay();
                        
                        console.log(`Successfully processed post ${postId}`);
                        
                        // Check limit immediately after processing each post
                        if (this.stats.progress >= this.settings.maxPosts) {
                            console.log(`🎯 Reached limit: ${this.stats.progress}/${this.settings.maxPosts} posts processed`);
                            this.showNotification(this.t('limitReached').replace('{count}', this.settings.maxPosts), 'success');
                            this.stop();
                            return; // Exit processPage immediately
                        }
                    } else {
                        console.log(`Failed to process post ${postId}`);
                    }
                    
                    // Random delay between actions
                    const delay = this.getRandomDelay();
                    console.log(`Waiting ${delay}ms before next action...`);
                    await this.loggedSleep(delay, 'перед следующим постом');
                    
                } catch (postError) {
                    console.error('Error processing individual post:', postError);
                    // Continue with next post even if one fails
                }
            }
            
            // Only scroll if still running (not stopped due to limit)
            console.log(`🔍 Проверка перед скроллингом: isRunning=${this.isRunning}, postCount=${posts.length}, consecutiveFiltered=${this.consecutiveFilteredPosts}/${this.settings?.maxScrollAttempts || 20}`);
            
            if (this.isRunning) {
                this.scrollAttempts++;
                console.log(`📜 Scrolling to load more posts... (attempt ${this.scrollAttempts})`);
                
                await this.scrollToLoadMore();
            } else {
                console.log('⏹️ Stopped - skipping scroll');
            }
            
        } catch (error) {
            console.error('Error in processPage:', error);
            throw error;
        }
    }

    findPosts() {
        // Try multiple selectors for Threads posts
        const selectors = [
            '[role="article"]',
            '[data-testid*="post"]', 
            '[data-testid*="thread"]',
            'article',
            '[data-pressable-container="true"]',
            'div[data-pressable-container="true"]',
            'div[tabindex="0"]', // Threads.com clickable posts
            'div[role="button"][tabindex="0"]', // Interactive post containers
            '.x1i10hfl.xjbqb8w', // Meta's common classes
            'div[class*="x1n2onr6"]', // Threads specific classes
        ];
        
        let posts = [];
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`Selector "${selector}" found ${elements.length} elements`);
            if (elements.length > 0) {
                posts = Array.from(elements);
                console.log(`Using selector: ${selector}`);
                break;
            }
        }
        
        // Filter out already processed and non-post elements
        const filteredPosts = posts.filter(post => {
            const postId = this.getPostId(post);
            console.log(`🔍 findPosts() checking ${postId.substring(0, 10)}: avoidDuplicates=${this.settings.avoidDuplicates}, inIgnoreList=${this.hasBeenCommentedBefore(postId)}, processed=${this.processedPosts.has(postId)}, validPost=${this.isValidPost(post)}`);
            
            if (this.settings.avoidDuplicates && this.hasBeenCommentedBefore(postId)) {
                console.log(`⏭️ findPosts(): Post ${postId.substring(0, 10)}... already commented before, skipping`);
                return false;
            }
            
            // Check if user is in ignored users list (avoid duplicate users)
            if (this.settings.avoidDuplicateUsers) {
                const userProfile = this.analyzeUserProfile(post);
                if (userProfile.username && this.isUserIgnored(userProfile.username)) {
                    console.log(`⏭️ findPosts(): Post ${postId.substring(0, 10)}... from ignored user ${userProfile.username}, skipping`);
                    return false;
                }
            }
            if (this.processedPosts.has(postId)) {
                console.log(`⏭️ findPosts(): Post ${postId.substring(0, 10)}... already processed this session, skipping`);
                return false;
            }
            if (!this.isValidPost(post)) {
                console.log(`⏭️ findPosts(): Post ${postId.substring(0, 10)}... not valid post, skipping`);
                return false;
            }
            return true;
        });
        
        console.log(`📊 findPosts(): Found ${posts.length} raw posts, ${filteredPosts.length} after filtering`);
        return filteredPosts;
    }

    getPostId(post) {
        try {
            // Try to find stable identifiers first
            let id = '';
            
            // 1. Look for data attributes that might be stable
            const dataId = post.getAttribute('data-id') || 
                          post.getAttribute('data-post-id') || 
                          post.getAttribute('data-thread-id');
            if (dataId) {
                id = dataId;
            } else {
                // 2. Try to find link to post (most stable)
                const timeLink = post.querySelector('a[href*="/post/"]') || 
                               post.querySelector('a[time]') ||
                               post.querySelector('time')?.closest('a');
                if (timeLink) {
                    const href = timeLink.getAttribute('href');
                    if (href && href.includes('/post/')) {
                        const postMatch = href.match(/\/post\/([^/?]+)/);
                        if (postMatch) {
                            id = postMatch[1];
                        }
                    }
                }
            }
            
            // 3. Fallback to content-based ID (but more stable than before)
            if (!id) {
                // Use first 200 chars of text + author if available
                const text = post.textContent?.substring(0, 200) || '';
                const authorElement = post.querySelector('a[href*="/@"]') || 
                                    post.querySelector('[data-testid*="username"]');
                const author = authorElement?.textContent?.trim() || '';
                const content = (author + '::' + text).replace(/\s+/g, ' ').trim();
                
                // Create hash
        let hash = 0;
                for (let i = 0; i < content.length; i++) {
                    const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
                }
                id = Math.abs(hash).toString(36);
            }
            
            return id.substring(0, 10);
        } catch (error) {
            console.error('Error generating post ID:', error);
            // Emergency fallback
            return 'fallback_' + Date.now().toString(36);
        }
    }

    isValidPost(post) {
        // Check if element is actually a post
        const hasText = post.textContent && post.textContent.trim().length > 5; // Less strict
        
        // Check if it looks like a post container (primary check)
        const looksLikePost = post.getAttribute('role') === 'article' ||
                             post.hasAttribute('data-pressable-container') ||
                             post.tagName === 'ARTICLE';
        
        // More comprehensive button search for threads.com
        const buttonSelectors = [
            'div[role="button"]', 'button', '[tabindex="0"]', // Generic interactive elements
            '[aria-label*="Like"]', '[aria-label*="Comment"]', '[aria-label*="Reply"]',
            '[aria-label*="лайк"]', '[aria-label*="комментар"]', '[aria-label*="ответ"]',
            '[aria-label*="Подобається"]', '[aria-label*="Відповісти"]', // Ukrainian
            '[title*="Like"]', '[title*="Comment"]', '[title*="Reply"]',
            '[data-testid*="like"]', '[data-testid*="reply"]',
            'svg[aria-label]', 'svg[title]' // Any SVG with labels
        ];
        
        const hasInteractionButtons = buttonSelectors.some(selector => 
            post.querySelector(selector)
        );
        
        // Be more permissive - if it has the data-pressable-container and text, likely a post
        if (looksLikePost && hasText) {
            // Apply post filtering if enabled
            if (this.settings.enablePostFilter) {
                const passesEngagementFilter = this.checkPostFilter(post);
                if (!passesEngagementFilter) {
                    console.log(`🔍 Post filtered out by engagement criteria`);
                    return false;
                }
                
                const passesContentFilter = this.checkContentTypeFilter(post);
                if (!passesContentFilter) {
                    console.log(`📄 Post filtered out by content type criteria`);
                    return false;
                }
            }
            
            console.log(`✅ Valid post found: hasText=${hasText}, looksLikePost=${looksLikePost}, hasButtons=${hasInteractionButtons}`);
            return true;
        }
        
        console.log(`❌ Invalid post: hasText=${hasText}, looksLikePost=${looksLikePost}, hasButtons=${hasInteractionButtons}`);
        return false;
    }

    checkPostFilter(post) {
        try {
            const { minLikes, maxLikes, minComments, maxComments } = this.settings;
            
            // Extract engagement numbers from post
            const engagement = this.extractEngagementNumbers(post);
            
            console.log(`🔍 Post engagement: ${engagement.likes} likes, ${engagement.comments} comments`);
            console.log(`📏 Filter criteria: likes(${minLikes}-${maxLikes}), comments(${minComments}-${maxComments})`);
            
            // Check if post meets filter criteria
            const likesInRange = engagement.likes >= minLikes && engagement.likes <= maxLikes;
            const commentsInRange = engagement.comments >= minComments && engagement.comments <= maxComments;
            
            // Pass if EITHER likes OR comments is within range
            const passesFilter = (likesInRange || commentsInRange);
            
            if (passesFilter) {
                console.log(`✅ Post passes filter: likes=${engagement.likes}, comments=${engagement.comments}`);
            } else {
                console.log(`❌ Post blocked by filter: likes=${engagement.likes}(${likesInRange}), comments=${engagement.comments}(${commentsInRange})`);
            }
            
            return passesFilter;
        } catch (error) {
            console.error('Error checking post filter:', error);
            return true; // Allow post if filter check fails
        }
    }

    extractEngagementNumbers(post) {
        let likes = 0;
        let comments = 0;
        
        try {
            // Look for engagement elements with various selectors
            const engagementSelectors = [
                '[aria-label*="Like"]', '[aria-label*="лайк"]', '[aria-label*="Нравится"]', '[aria-label*="Подобається"]',
                '[aria-label*="Comment"]', '[aria-label*="комментар"]', '[aria-label*="Ответ"]', '[aria-label*="Reply"]', '[aria-label*="Відповісти"]',
                'div[role="button"]', 'button'
            ];
            
            const allElements = [];
            engagementSelectors.forEach(selector => {
                const elements = post.querySelectorAll(selector);
                elements.forEach(el => allElements.push(el));
            });
            
            // Also check text content for patterns like "5 likes", "10 комментариев"
            const textContent = post.textContent || '';
            
            // Extract likes from aria-labels and text
            allElements.forEach(element => {
                const ariaLabel = element.getAttribute('aria-label') || '';
                const text = element.textContent || '';
                const combinedText = (ariaLabel + ' ' + text).toLowerCase();
                
                // Match like patterns - updated to handle formatted numbers
                const likePatterns = [
                    /([\d\s,\.]+)\s*(?:like|лайк|нравится)/i,
                    /(?:поставить\s*"нравится")\s*([\d\s,\.]+)/i,
                    /(?:like|лайк|нравится).*?([\d\s,\.]+)/i
                ];
                
                likePatterns.forEach(pattern => {
                    const match = combinedText.match(pattern);
                    if (match) {
                        const num = this.parseFormattedNumber(match[1]);
                        if (!isNaN(num) && num > likes) {
                            likes = num;
                        }
                    }
                });
                
                // Match comment patterns - updated to handle formatted numbers
                const commentPatterns = [
                    /([\d\s,\.]+)\s*(?:comment|комментар|ответ|reply)/i,
                    /(?:ответ|comment|reply).*?([\d\s,\.]+)/i
                ];
                
                commentPatterns.forEach(pattern => {
                    const match = combinedText.match(pattern);
                    if (match) {
                        const num = this.parseFormattedNumber(match[1]);
                        if (!isNaN(num) && num > comments) {
                            comments = num;
                        }
                    }
                });
            });
            
            // Fallback: look for any numbers in buttons that might represent engagement
            if (likes === 0 || comments === 0) {
                allElements.forEach(element => {
                    const text = element.textContent?.trim() || '';
                    // Updated regex to capture formatted numbers but only when at least one digit is present
                    const numbers = text.match(/[\d][\d\s,\.]*/g);
                    if (numbers) {
                        numbers.forEach(numStr => {
                            const num = this.parseFormattedNumber(numStr);
                            if (!isNaN(num) && num > 0) {
                                const context = element.textContent?.toLowerCase() || '';
                                const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
                                
                                if ((context.includes('like') || context.includes('лайк') || context.includes('нравится') || 
                                     ariaLabel.includes('like') || ariaLabel.includes('лайк') || ariaLabel.includes('нравится')) && 
                                     num > likes) {
                                    likes = num;
                                } else if ((context.includes('comment') || context.includes('комментар') || context.includes('ответ') ||
                                          ariaLabel.includes('comment') || ariaLabel.includes('комментар') || ariaLabel.includes('ответ')) && 
                                          num > comments) {
                                    comments = num;
                                }
                            }
                        });
                    }
                });
            }
            
        } catch (error) {
            console.error('Error extracting engagement numbers:', error);
        }
        
        return { likes, comments };
    }

    parseFormattedNumber(numberString) {
        try {
            if (!numberString) return 0;
            
            // Convert to string and clean up
            const cleanStr = String(numberString)
                .trim()
                .replace(/\s+/g, '') // Remove all spaces (5 663 -> 5663)
                .replace(/,/g, '')   // Remove commas (5,663 -> 5663)
                .replace(/\./g, ''); // Remove dots (5.663 -> 5663, but be careful with decimals)
            
            // Extract only digits
            const digitsOnly = cleanStr.replace(/[^\d]/g, '');
            
            const result = parseInt(digitsOnly, 10);
            
            console.log(`📊 parseFormattedNumber: "${numberString}" -> "${cleanStr}" -> "${digitsOnly}" -> ${result}`);
            
            return isNaN(result) ? 0 : result;
        } catch (error) {
            console.error('Error parsing formatted number:', error);
            return 0;
        }
    }

    async startKeywordSearchMode() {
        try {
            console.log('🔎 Starting keyword search automation');
            this.addLogItem('🔍 Запуск поиска по ключевым словам', 'info');
            
            // Send keyword search start notification to popup
            chrome.runtime.sendMessage({
                type: 'keywordSearchStart',
                keywords: this.settings.searchKeywords || []
            });
            
            const keywords = [...this.settings.searchKeywords];
            if (keywords.length === 0) {
                console.error('❌ No keywords configured for search');
                this.showNotification(this.t('noKeywords'), 'error');
                chrome.runtime.sendMessage({
                    type: 'keywordSearchEnd',
                    reason: 'no_keywords'
                });
                return;
            }
            
            console.log(`🎯 Keywords: ${keywords.join(', ')}`);
            console.log(`📊 Max posts per keyword: ${this.settings.maxPostsPerKeyword}`);
            console.log(`⏱️ Delay between keywords: ${this.settings.keywordDelay}s`);
            
            // Randomize keywords if enabled
            if (this.settings.randomizeKeywords) {
                this.shuffleArray(keywords);
                console.log(`🔀 Randomized order: ${keywords.join(', ')}`);
            }
            
            // Process keywords
            await this.processKeywords(keywords);
            
            // Send keyword search completion notification
            chrome.runtime.sendMessage({
                type: 'keywordSearchEnd',
                reason: 'completed',
                stats: this.stats
            });
            
        } catch (error) {
            console.error('Error in keyword search mode:', error);
            this.showNotification(this.t('keywordSearchError'), 'error');
            
            // Send error notification
            chrome.runtime.sendMessage({
                type: 'keywordSearchEnd',
                reason: 'error',
                error: error.message
            });
        }
    }

    async processKeywords(keywords) {
        // Store keywords and starting index for state management
        this.keywords = keywords;
        this.currentKeywordIndex = this.currentKeywordIndex || 0;
        
        // Process from current index
        for (let i = this.currentKeywordIndex; i < keywords.length && this.isRunning; i++) {
            const keyword = keywords[i];
            this.currentKeyword = keyword;
            this.currentKeywordIndex = i;
            
            try {
                console.log(`\n🔍 Processing keyword ${i + 1}/${keywords.length}: "${keyword}"`);
                this.addLogItem(`🔍 Ключевое слово: "${keyword}" (${i + 1}/${keywords.length})`, 'info');
                
                // Save state before navigation
                await this.saveKeywordSearchState();
                
                // Navigate to search
                await this.searchByKeyword(keyword);
                
                // Note: After navigation, page will reload and execution will continue in continueKeywordSearchFromState()
                return; // Exit this function as page will reload
                
            } catch (error) {
                console.error(`❌ Error processing keyword "${keyword}":`, error);
                continue; // Continue with next keyword
            }
        }
        
        // If we reach here, all keywords are processed
        await this.finishKeywordSearch();
    }

    async searchByKeyword(keyword) {
        const searchUrl = this.buildSearchUrl(keyword);
        console.log(`🌐 Navigating to: ${searchUrl}`);
        
        // Save keyword search state before navigation
        await this.saveKeywordSearchState();
        
        // Navigate to search URL
        window.location.href = searchUrl;
    }

    buildSearchUrl(keyword) {
        const baseUrl = 'https://www.threads.net/search';
        const encodedKeyword = encodeURIComponent(keyword);
        
        let url = `${baseUrl}?q=${encodedKeyword}`;
        
        // Add section filter
        if (this.settings.searchSection === 'recent') {
            url += '&filter=recent';
        }
        // 'top' is default, no additional parameter needed
        
        return url;
    }
    async processSearchResults(keyword) {
        try {
            // Debug keyword value
            console.log(`📄 Processing search results for keyword="${keyword}", currentKeyword="${this.currentKeyword}"`);
            
            // Use currentKeyword if keyword is null/undefined
            const effectiveKeyword = keyword || this.currentKeyword || 'unknown';
            console.log(`📄 Using effective keyword: "${effectiveKeyword}"`);
            
            let processedCount = 0;
            const maxPosts = this.settings.maxPostsPerKeyword || 10;
            // Added: scroll control for keyword mode
            let totalScrolls = 0;
            const maxTotalScrolls = Math.max(10, maxPosts * 10);
            let consecutiveEmptyScrolls = 0;
            const maxEmptyScrolls = 5;
            
            console.log(`🎯 Target: ${maxPosts} posts for keyword "${effectiveKeyword}"`);
            
            while (processedCount < maxPosts && this.isRunning) {
                // Find posts on current page
                const posts = this.findPosts();
                console.log(`📍 Found ${posts.length} posts on page (scrolls=${totalScrolls})`);
                
                // Consider only unprocessed posts
                const candidatePosts = posts.filter(p => !this.processedPosts.has(this.getPostId(p)));

                if (candidatePosts.length === 0) {
                    console.log('📜 No new posts found, trying to load more...');
                    await this.scrollToLoadMore();
                    await this.loggedSleep(3000, 'загрузка новых постов');
                    totalScrolls++;
                    consecutiveEmptyScrolls++;
                    if (totalScrolls >= maxTotalScrolls || consecutiveEmptyScrolls >= maxEmptyScrolls) {
                        console.log('🧭 Stopping search for this keyword: feed exhausted');
                        break;
                    }
                    continue;
                }
                consecutiveEmptyScrolls = 0;
                
                // Process available posts
                let newPostsFound = 0;
                for (const post of candidatePosts) {
                    if (processedCount >= maxPosts || !this.isRunning) break;
                    
                    const postId = this.getPostId(post);
                    
                    // Skip if already processed
                    if (this.processedPosts.has(postId)) {
                        continue;
                    }
                    
                    // Skip if already commented before (ignore list) - DON'T count as processed
                    console.log(`🔍 Checking duplicates for ${postId.substring(0, 10)}: avoidDuplicates=${this.settings.avoidDuplicates}, inIgnoreList=${this.hasBeenCommentedBefore(postId)}`);
                    if (this.settings.avoidDuplicates && this.hasBeenCommentedBefore(postId)) {
                        console.log(`⏭️ Post ${postId.substring(0, 10)}... already commented before, skipping`);
                        continue; // Continue searching for new posts without counting this
                    }
                    
                    // Skip if user is in ignored users list (avoid duplicate users) - DON'T count as processed
                    if (this.settings.avoidDuplicateUsers) {
                        const userProfile = this.analyzeUserProfile(post);
                        if (userProfile.username && this.isUserIgnored(userProfile.username)) {
                            console.log(`⏭️ Post ${postId.substring(0, 10)}... from ignored user ${userProfile.username}, skipping`);
                            continue; // Continue searching for new posts without counting this
                        }
                    }
                    
                    newPostsFound++;
                    console.log(`\n🔗 Processing post ${processedCount + 1}/${maxPosts} for "${effectiveKeyword}"`);
                    console.log(`📝 Post ID: ${postId.substring(0, 10)}...`);
                    
                    try {
                        // Check if post passes ALL filters and limits
                        if (!this.passesAllFilters(post)) {
                            console.log(`⏭️ Post skipped due to filters`);
                            this.processedPosts.add(postId); // Mark as processed but don't count
                            continue;
                        }
                        
                        // Check rate limits before processing
                        if (!this.canProcessPost()) {
                            console.log(`⏸️ Rate limit reached, waiting for next hourly window...`);
                            await this.waitForHourlySlot();
                            continue;
                        }
                        
                        // Process the post
                        const success = await this.processPost(post);
                        
                        // ALWAYS mark as processed first
                        this.processedPosts.add(postId);
                        
                        if (success) {
                        processedCount++;
                        if (this.settings.avoidDuplicates) {
                            await this.markCommented(postId);
                        }
                        
                        // Add user to ignored users list if enabled
                        if (this.settings.avoidDuplicateUsers) {
                            const userProfile = this.analyzeUserProfile(post);
                            if (userProfile.username) {
                                await this.markUserIgnored(userProfile.username);
                            }
                        }
                        
                        this.stats.progress++;
                            console.log(`✅ Successfully processed ${processedCount}/${maxPosts} posts for "${effectiveKeyword}"`);
                            this.addLogItem(`✅ Пост обработан (${processedCount}/${maxPosts})`, 'success');
                        } else {
                            console.log(`⚠️ Post processing failed, but continuing...`);
                        }
                        
                        // Update stats and save state
                        this.sendStatsUpdate();
                        this.updateBottomPanelDisplay();
                        await this.saveKeywordSearchState();
                        
                        // Check global limit behavior
                        if (this.stats.progress >= this.settings.maxPosts) {
                            console.log(`🎯 Reached global limit: ${this.stats.progress}/${this.settings.maxPosts} posts processed`);
                            console.log('📝 Global limit reached, stopping automation');
                            this.showNotification(`Достигнут лимит ${this.settings.maxPosts} постов! Останавливаем...`, 'success');
                            this.stop();
                            return; // Exit immediately
                        }
                        
                        // Break if we reached keyword target
                        if (processedCount >= maxPosts) {
                            console.log(`🎯 Reached target of ${maxPosts} posts, stopping.`);
                            break;
                        }
                        
                        // Random delay between posts
                        const delay = this.getRandomDelay();
                        console.log(`⏳ Waiting ${delay}ms before next post...`);
                        await this.loggedSleep(delay, 'между постами в поиске');
                        
                    } catch (error) {
                        console.error(`❌ Error processing post for "${keyword}":`, error);
                        this.processedPosts.add(postId); // Mark as processed to avoid retrying
                        continue;
                    }
                }
                
                console.log(`📊 Found ${newPostsFound} new posts to process`);
                
                // If we processed enough posts, exit
                if (processedCount >= maxPosts) {
                    break;
                }

                console.log(`📊 Iteration result: processed=${processedCount}, newPostsChecked=${newPostsFound}`);
                
                if (processedCount < maxPosts) {
                    await this.scrollToLoadMore();
                    await this.loggedSleep(2500, 'загрузка новых постов');
                    totalScrolls++;
                    if (totalScrolls >= maxTotalScrolls) {
                        console.log('🧭 Reached maximum scrolls for this keyword');
                        break;
                    }
                }
            }
            
            console.log(`🎯 Completed processing "${effectiveKeyword}": ${processedCount}/${maxPosts} posts`);
            
            // Move to next keyword after delay
            if (this.currentKeywordIndex < this.keywords.length - 1 && this.isRunning) {
                console.log(`⏳ Waiting ${this.settings.keywordDelay}s before next keyword...`);
                await this.loggedSleep(this.settings.keywordDelay * 1000, `между ключевыми словами (${this.settings.keywordDelay}с)`);
                
                // Continue with next keyword
                this.currentKeywordIndex++;
                const nextKeyword = this.keywords[this.currentKeywordIndex];
                this.currentKeyword = nextKeyword;
                
                console.log(`🔍 Moving to next keyword: "${nextKeyword}"`);
                await this.saveKeywordSearchState();
                await this.searchByKeyword(nextKeyword);
            } else {
                // Finished all keywords
                await this.finishKeywordSearch();
            }
            
        } catch (error) {
            console.error(`❌ Error processing search results for "${keyword}":`, error);
            throw error;
        }
    }

    async waitForPageLoad() {
        // Wait for search results to load
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            // Check if we're on search page and posts are loaded
            const isSearchPage = window.location.href.includes('/search?q=');
            const hasPosts = this.findPosts().length > 0;
            
            if (isSearchPage && (hasPosts || attempts > 5)) {
                console.log('📄 Search page loaded');
                return;
            }
            
            attempts++;
            await this.sleep(1000);
        }
        
        console.log('⚠️ Page load timeout, continuing anyway');
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    async processPost(post) {
        try {
            const postId = this.getPostId(post);
            
            // Check if post is already being processed
            if (this.currentlyProcessingPosts && this.currentlyProcessingPosts.has(postId)) {
                console.log(`⚠️ Post ${postId} already being processed, skipping duplicate`);
                return false;
            }
            
            // Add to currently processing set
            if (!this.currentlyProcessingPosts) {
                this.currentlyProcessingPosts = new Set();
            }
            this.currentlyProcessingPosts.add(postId);
            
            try {
            console.log(`🔗 Processing post ${postId}...`);
            
            // Skip if already commented before (ignore list) - DON'T count as filtered
            console.log(`🔍 Checking duplicates for ${postId}: avoidDuplicates=${this.settings.avoidDuplicates}, inIgnoreList=${this.hasBeenCommentedBefore(postId)}`);
            if (this.settings.avoidDuplicates && this.hasBeenCommentedBefore(postId)) {
                console.log(`⏭️ Post ${postId} already commented before, skipping`);
                this.processedPosts.add(postId); // Mark as processed to avoid re-checking
                this.currentlyProcessingPosts.delete(postId);
                return false; // Return false to continue processing other posts
            }

            // Skip if user is in ignored users list (avoid duplicate users) - DON'T count as filtered
            if (this.settings.avoidDuplicateUsers) {
                const userProfile = this.analyzeUserProfile(post);
                if (userProfile.username && this.isUserIgnored(userProfile.username)) {
                    console.log(`⏭️ Post ${postId} from ignored user ${userProfile.username}, skipping`);
                    this.processedPosts.add(postId); // Mark as processed to avoid re-checking
                    this.currentlyProcessingPosts.delete(postId);
                    return false; // Return false to continue processing other posts
                }
            }
            
            // Check if post passes all filters before processing
            if (!this.passesAllFilters(post)) {
                console.log(`⏭️ Post ${postId} filtered out, skipping...`);
                this.processedPosts.add(postId); // Mark as processed to avoid re-checking
                
                // Increment consecutive filtered posts counter
                this.consecutiveFilteredPosts++;
                
                // Check if we've filtered too many posts consecutively
                const maxFiltered = this.settings?.maxScrollAttempts || 20;
                if (this.consecutiveFilteredPosts >= maxFiltered) {
                    console.log(`🚫 Stopped: ${maxFiltered} consecutive filtered posts`);
                    this.addLogItem(`🚫 Остановлено: ${maxFiltered} отфильтрованных постов подряд`, 'warning');
                    this.stop();
                    return;
                }

                this.currentlyProcessingPosts.delete(postId);
                return;
            }
            
            // Decide what actions to take
            const actions = this.decideActions();
            console.log(`🎯 Actions chosen: ${actions.join(' + ')}`);
            
            let successCount = 0;
            
            // Execute all actions for this post
            for (const action of actions) {
                try {
                    let actionSuccess = false;
                    
                    if (action === 'comment') {
                        console.log('🗨️ Executing comment action...');
                        actionSuccess = await this.postComment(post);
                        if (actionSuccess) {
                            this.stats.comments++;
                            this.recordActionTimestamp('comment');
                            console.log('✅ Comment action successful');
                            if (!this.canProcessPost()) {
                                await this.waitForHourlySlot();
                                break;
                            }
                        }
                    } else if (action === 'like') {
                        console.log('👍 Executing like action...');
                        actionSuccess = await this.likePost(post);
                        if (actionSuccess) {
                            this.stats.likes++;
                            this.recordActionTimestamp('like');
                            console.log('✅ Like action successful');
                            if (!this.canProcessPost()) {
                                await this.waitForHourlySlot();
                                break;
                            }
                        }
                    }
                    
                    if (actionSuccess) {
                        successCount++;
                        
                        // Small delay between actions on same post
                        if (actions.length > 1) {
                            const actionDelay = 1000 + Math.random() * 2000; // 1-3 seconds
                            await this.loggedSleep(actionDelay, 'между лайком и комментарием');
                        }
                    }
                    
                } catch (error) {
                    console.error(`❌ Error executing ${action} action:`, error);
                }
            }
            
            console.log(`📊 Post ${postId}: ${successCount}/${actions.length} actions successful`);
            return successCount > 0;
                
            } finally {
                // Remove from currently processing set
                if (this.currentlyProcessingPosts) {
                    this.currentlyProcessingPosts.delete(postId);
                }
            }
            
        } catch (error) {
            console.error('❌ Error processing post:', error);
            // Make sure to clean up even on error
            if (this.currentlyProcessingPosts) {
                this.currentlyProcessingPosts.delete(postId);
            }
            return false;
        }
    }

    checkContentTypeFilter(post) {
        try {
            const contentType = this.detectContentType(post);
            const { filterPhotoOnly, filterVideoOnly, filterTextMedia, filterTextOnly } = this.settings;
            
            console.log(`📄 Post content type: ${contentType}`);
            console.log(`🎛️ Content filters: photo=${filterPhotoOnly}, video=${filterVideoOnly}, textMedia=${filterTextMedia}, textOnly=${filterTextOnly}`);
            
            // Check if any content type filter is enabled
            const anyFilterEnabled = filterPhotoOnly || filterVideoOnly || filterTextMedia || filterTextOnly;
            if (!anyFilterEnabled) {
                console.log(`📄 No content type filters enabled, allowing post`);
                return true;
            }
            
            // Check if this content type is allowed
            let isAllowed = false;
            switch (contentType) {
                case 'photo-only':
                    isAllowed = filterPhotoOnly;
                    break;
                case 'video-only':
                    isAllowed = filterVideoOnly;
                    break;
                case 'text-media':
                    isAllowed = filterTextMedia;
                    break;
                case 'text-only':
                    isAllowed = filterTextOnly;
                    break;
                default:
                    isAllowed = filterTextOnly; // Default to text-only for unknown types
            }
            
            if (isAllowed) {
                console.log(`✅ Post content type '${contentType}' is allowed`);
            } else {
                console.log(`❌ Post content type '${contentType}' is blocked by filters`);
            }
            
            return isAllowed;
        } catch (error) {
            console.error('Error checking content type filter:', error);
            return true; // Allow post if filter check fails
        }
    }

    detectContentType(post) {
        try {
            // Look for images and videos in the post
            const images = post.querySelectorAll('img');
            const videos = post.querySelectorAll('video');
            
            // Filter out UI elements (small images, icons, etc.)
            const contentImages = Array.from(images).filter(img => {
                const src = img.src || '';
                const alt = img.alt || '';
                const width = img.width || 0;
                const height = img.height || 0;
                
                // Skip small images, likely UI elements
                if (width > 0 && height > 0 && (width < 50 || height < 50)) {
                    return false;
                }
                
                // Skip common UI patterns
                if (src.includes('avatar') || src.includes('profile') || 
                    alt.includes('avatar') || alt.includes('profile') ||
                    src.includes('icon') || alt.includes('icon')) {
                    return false;
                }
                
                return true;
            });
            
            const contentVideos = Array.from(videos).filter(video => {
                // Basic filter for content videos vs UI elements
                const width = video.width || video.videoWidth || 0;
                const height = video.height || video.videoHeight || 0;
                
                // Skip very small videos (likely UI elements)
                return !(width > 0 && height > 0 && (width < 100 || height < 100));
            });
            
            // Get text content (excluding UI elements)
            const textElements = post.querySelectorAll('p, div[data-testid*="text"], span');
            let meaningfulText = '';
            
            textElements.forEach(el => {
                const text = el.textContent?.trim() || '';
                // Skip short text that's likely UI (buttons, timestamps, etc.)
                if (text.length > 10 && !text.includes('•') && !text.includes('ago')) {
                    meaningfulText += text + ' ';
                }
            });
            
            meaningfulText = meaningfulText.trim();
            
            const hasImages = contentImages.length > 0;
            const hasVideos = contentVideos.length > 0;
            const hasText = meaningfulText.length > 20; // Minimum text length for meaningful content
            
            console.log(`📊 Content analysis: images=${contentImages.length}, videos=${contentVideos.length}, textLength=${meaningfulText.length}`);
            
            // Determine content type
            if (hasImages && !hasVideos && !hasText) {
                return 'photo-only';
            } else if (hasVideos && !hasImages && !hasText) {
                return 'video-only';
            } else if ((hasImages || hasVideos) && hasText) {
                return 'text-media';
            } else if (!hasImages && !hasVideos && hasText) {
                return 'text-only';
            } else {
                // Default case - treat as text-only if we can't determine
                return 'text-only';
            }
        } catch (error) {
            console.error('Error detecting content type:', error);
            return 'text-only'; // Default fallback
        }
    }

    async attachMediaFiles(commentInput) {
        try {
            console.log('📎 Starting media file attachment process...');
            
            // Check if media attachment is enabled
            if (!this.settings.enableAttachMedia) {
                console.log('📎 Media attachment is disabled in settings');
                return true;
            }
            
            console.log(`📎 Media settings: useAllMediaFiles=${this.settings.useAllMediaFiles}, deleteAfterUse=${this.settings.deleteMediaAfterUse}, randomOrder=${this.settings.randomMediaOrder}`);
            
            // Check if we have media files to attach
            const hasMediaFiles = this.settings.selectedMediaFiles && this.settings.selectedMediaFiles.length > 0;
            console.log(`📎 Media files available: ${hasMediaFiles ? this.settings.selectedMediaFiles.length + ' files' : 'none'}`);
            
            if (!hasMediaFiles) {
                console.log('⚠️ No media files selected in settings, skipping attachment');
                return true;
            }
            
            // Wait a bit more for modal to fully load with all buttons
            await this.sleep(1000);
            
            // Check if modal is open
            const modal = document.querySelector('dialog, [role="dialog"], [aria-modal="true"]');
            console.log(`📎 Modal window status: ${modal ? 'open' : 'not found'}`);
            
            if (modal) {
                // Log modal structure for debugging
                const modalButtons = modal.querySelectorAll('button');
                console.log(`📎 Found ${modalButtons.length} buttons in modal:`);
                modalButtons.forEach((btn, i) => {
                    const text = (btn.textContent || '').trim();
                    const aria = btn.getAttribute('aria-label') || '';
                    if (text || aria) {
                        console.log(`📎 Modal button ${i}: "${text}" aria="${aria}"`);
                    }
                });
            }
            
            // Look for file input or attachment button
            let fileInput = this.findMediaAttachmentArea(commentInput);
            
            if (!fileInput) {
                console.log('❌ No media attachment area found, attempting to create drag and drop simulation');
                return await this.simulateDragAndDrop(commentInput);
            }
            
            console.log(`✅ Found media attachment area: ${fileInput.tagName} with aria-label="${fileInput.getAttribute('aria-label')}"`);
            return await this.uploadFilesToInput(fileInput);
            
        } catch (error) {
            console.error('❌ Error in media attachment:', error);
            return false;
        }
    }

    async findExpandConstructorButton() {
        console.log('🔍 Looking for expand constructor button...');
        
        // Wait a bit for DOM to settle after reply button click
        await this.sleep(500);
        
        // Debug: Log all visible buttons in reply area
        const allButtons = document.querySelectorAll('div[role="button"], button, [role="dialog"] div[role="button"]');
        console.log(`🔍 Found ${allButtons.length} buttons on page`);
        
        let debugCount = 0;
        for (const btn of allButtons) {
            if (this.isVisible(btn) && debugCount < 15) {
                const text = (btn.textContent || '').trim().substring(0, 50);
                const ariaLabel = btn.getAttribute('aria-label') || '';
                const classList = Array.from(btn.classList).join(' ');
                console.log(`🔍 Button ${debugCount}: text="${text}" aria="${ariaLabel}" classes="${classList}"`);
                debugCount++;
            }
        }
        
        // Specific selectors for expand constructor button based on Browser MCP analysis
        const possibleSelectors = [
            // Exact selectors from observation
            'button[aria-label="Развернуть конструктор"]',
            'button img[alt="Развернуть конструктор"]',
            
            // Fallback selectors based on patterns observed
            '[role="button"][aria-label*="конструктор"]',
            '[role="button"][aria-label*="развернуть"]',
            'button[aria-label*="конструктор"]',
            'button[aria-label*="развернуть"]',
            
            // Generic patterns for buttons near comment input
            'textbox[aria-label*="публикацию"] ~ button',
            '[contenteditable="true"] ~ button',
            
            // Look for any button with expand-related characteristics  
            'div[role="button"] svg[viewBox="0 0 24 24"]',
            '[role="dialog"] div[role="button"] svg',
            'div[role="button"] svg'
        ];
        
        for (const selector of possibleSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    if (this.isVisible(element) && this.looksLikeExpandButton(element)) {
                        console.log(`✅ Found expand constructor button: ${selector}`);
                        return element;
                    }
                }
            } catch (error) {
                console.log(`Error with selector ${selector}:`, error);
            }
        }
        
        // Alternative approach: look for buttons in modal areas
        const modalAreas = document.querySelectorAll('[role="dialog"], [aria-modal="true"], .modal, [data-testid*="modal"]');
        for (const modal of modalAreas) {
            const buttons = modal.querySelectorAll('div[role="button"], button');
            for (const button of buttons) {
                if (this.isVisible(button) && this.looksLikeExpandButton(button)) {
                    console.log('✅ Found expand button in modal area');
                    return button;
                }
            }
        }
        
        console.log('❌ Expand constructor button not found');
        return null;
    }
    
    looksLikeExpandButton(element) {
        const text = (element.textContent || '').toLowerCase().trim();
        const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
        
        // Log for debugging
        console.log(`🔍 Checking button: text="${text}" aria="${ariaLabel}"`);
        
        // EXACT MATCH: Most reliable check first
        if (text.includes('развернуть конструктор') || ariaLabel.includes('развернуть конструктор')) {
            console.log(`✅ EXACT MATCH: Found "Развернуть конструктор" button!`);
            return true;
        }
        
        // SPECIFIC KEYWORDS: Check for specific expand-related keywords
        const expandKeywords = [
            'развернуть', 'конструктор', 'expand', 'constructor', 'compose'
        ];
        
        const hasExpandKeyword = expandKeywords.some(keyword => 
            text.includes(keyword) || ariaLabel.includes(keyword)
        );
        
        if (hasExpandKeyword) {
            console.log(`✅ KEYWORD MATCH: Found expand keyword: text="${text}" aria="${ariaLabel}"`);
            return true;
        }
        
        // CONTEXT-BASED: Check if button is in the right context
        const isInCommentArea = element.closest('[role="dialog"], [aria-modal="true"], textbox, [contenteditable="true"]');
        const hasSvg = element.querySelector('svg');
        const buttonRect = element.getBoundingClientRect();
        const isSmallButton = buttonRect.width < 80 && buttonRect.height < 80;
        
        // Check for buttons that could be expand UI elements
        const couldBeExpandButton = isInCommentArea && hasSvg && isSmallButton && text.length < 20;
        
        if (couldBeExpandButton) {
            console.log(`✅ CONTEXT MATCH: Could be expand button: text="${text}" aria="${ariaLabel}"`);
            return true;
        }
        
        return false;
    }

    async findExpandButtonAfterReply() {
        console.log('🔍 Looking for expand button using alternative method...');
        
        // Look for buttons that might be arrow/expand icons in the reply interface
        const possibleExpandButtons = [
            // Look for up arrows, expand icons
            'div[role="button"]:has(svg) img', // Buttons with SVG and images
            'div[role="button"] svg[viewBox="0 0 24 24"]', // 24x24 SVG buttons
            '[role="dialog"] div[role="button"]:not([aria-label*="Отмена"]):not([aria-label*="Cancel"])', // Dialog buttons except cancel
            '[aria-modal="true"] div[role="button"]:not([aria-label*="Отмена"])', // Modal buttons except cancel
            
            // Look for small clickable elements near text input
            'div[role="button"][style*="cursor"]', // Buttons with cursor pointer
            'div[role="button"]:has(path)', // Buttons with SVG paths
            
            // Try finding buttons by their position/context
            '[contenteditable="true"] ~ div[role="button"]', // Buttons near editable content
            '[role="textbox"] ~ div[role="button"]' // Buttons near textbox
        ];
        
        for (const selector of possibleExpandButtons) {
            try {
                const elements = document.querySelectorAll(selector);
                console.log(`🔍 Checking selector "${selector}": found ${elements.length} elements`);
                
                for (const element of elements) {
                    if (this.isVisible(element)) {
                        const text = (element.textContent || '').trim();
                        const ariaLabel = element.getAttribute('aria-label') || '';
                        
                        console.log(`🔍 Alternative expand check: text="${text}" aria="${ariaLabel}"`);
                        
                        // Look for buttons that might expand the interface
                        if (this.couldBeExpandButton(element)) {
                            console.log(`✅ Found potential expand button with alternative method`);
                            return element;
                        }
                    }
                }
            } catch (error) {
                console.log(`Error with alternative selector ${selector}:`, error);
            }
        }
        
        console.log('❌ No expand button found with alternative method');
        return null;
    }
    
    couldBeExpandButton(element) {
        const text = (element.textContent || '').toLowerCase().trim();
        const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
        
        // Check for small buttons with SVG icons (common expand pattern)
        const hasSvg = element.querySelector('svg');
        const rect = element.getBoundingClientRect();
        const isSmallButton = rect.width < 80 && rect.height < 80;
        
        // Check if it's in the right area (comment/reply area)
        const isInReplyArea = element.closest('[role="dialog"], [aria-modal="true"], form');
        
        // Check for expand-like characteristics
        const looksLikeExpand = text.length < 10 && hasSvg && isSmallButton && isInReplyArea;
        
        // Check if it's NOT a common non-expand button
        const notExpandButton = text.includes('отмена') || text.includes('cancel') || 
                               text.includes('закрыть') || text.includes('close') ||
                               ariaLabel.includes('отмена') || ariaLabel.includes('cancel');
        
        return looksLikeExpand && !notExpandButton;
    }

    findMediaAttachmentArea(commentInput) {
        console.log('📎 Looking for media attachment area...');
        
        // First, try to find the media attachment button using observed selectors from Browser MCP
        const mediaSelectors = [
            // Exact selectors from Browser MCP observation
            'button[aria-label="Прикрепить медиа"]',
            'button img[alt="Прикрепить медиа"]',
            
            // Dialog-specific selectors (media button appears in modal)
            'dialog button[aria-label="Прикрепить медиа"]',
            '[role="dialog"] button[aria-label="Прикрепить медиа"]',
            
            // Fallback selectors for media buttons
            'button[aria-label*="медиа"]',
            'button[aria-label*="прикрепить"]',
            '[role="dialog"] button[aria-label*="медиа"]',
            '[role="dialog"] button[aria-label*="прикрепить"]',
            
            // Generic media button patterns
            '[role="dialog"] button[aria-label*="media"]',
            '[role="dialog"] button[aria-label*="attach"]',
            
            // Original specific selector (as fallback)
            '#mount_0_0_43 > div > div > div:nth-child(3) > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div > div.x6s0dn4.x78zum5.xl56j7k.x1n2onr6.x1vjfegm > div > div > div > div > div > div.x1l34066.x1odjw0f > div:nth-child(2) > div > div.xtqikln.x78zum5.x1iyjqo2 > div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r > div.x6s0dn4.x78zum5.xc9qbxq.x1qfufaz.x1gslohp > div:nth-child(1) > div'
        ];
        
        for (const selector of mediaSelectors) {
            try {
                const mediaButton = document.querySelector(selector);
                if (mediaButton && this.isVisible(mediaButton)) {
                    console.log(`✅ Found media button using selector: ${selector}`);
                    return mediaButton;
                }
            } catch (error) {
                console.log(`Error with media selector ${selector}:`, error);
            }
        }
        
        // Alternative approach: Search by text content in ALL buttons (not just dialog)
        console.log('📎 Trying alternative text-based search for media button...');
        const allButtons = document.querySelectorAll('button');
        console.log(`📎 Found ${allButtons.length} total buttons on page`);
        
        for (const button of allButtons) {
            const text = (button.textContent || '').toLowerCase().trim();
            const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase().trim();
            
            // Debug logging for potentially matching buttons
            if (text.includes('медиа') || ariaLabel.includes('медиа') || 
                text.includes('media') || ariaLabel.includes('media') ||
                text.includes('прикрепить') || ariaLabel.includes('прикрепить') ||
                text.includes('attach') || ariaLabel.includes('attach')) {
                console.log(`📎 Checking potential media button: text="${text}" aria="${ariaLabel}"`);
            }
            
            if (text.includes('прикрепить медиа') || ariaLabel.includes('прикрепить медиа') ||
                (text.includes('прикрепить') && text.includes('медиа')) ||
                (ariaLabel.includes('прикрепить') && ariaLabel.includes('медиа')) ||
                text.includes('attach media') || ariaLabel.includes('attach media') ||
                (text.includes('attach') && text.includes('media')) ||
                (ariaLabel.includes('attach') && ariaLabel.includes('media'))) {
                
                console.log(`✅ Found media button by text search: "${text}" aria="${ariaLabel}"`);
                return button;
            }
        }

        // Try to find file input near the comment input
        const possibleSelectors = [
            'input[type="file"]',
            'input[accept*="image"]',
            'input[accept*="video"]',
            '[role="button"][aria-label*="attach"]',
            '[role="button"][aria-label*="photo"]',
            '[role="button"][aria-label*="media"]',
            'button[aria-label*="attach"]',
            'button[aria-label*="photo"]',
            'button[aria-label*="media"]',
            // Additional selectors for attachment buttons
            'button[class*="attach"]',
            'button[class*="media"]',
            'button[class*="photo"]',
            'div[class*="attach"][role="button"]',
            'div[class*="media"][role="button"]',
            'div[class*="photo"][role="button"]'
        ];
        
        // Search in the comment container first
        const commentContainer = commentInput.closest('form, [role="dialog"], .comment-container, [data-testid*="comment"]') || document;
        
        for (const selector of possibleSelectors) {
            const element = commentContainer.querySelector(selector);
            if (element && this.isVisible(element)) {
                console.log(`📎 Found media attachment element: ${selector}`);
                return element;
            }
        }
        
        // Also try to find attachment buttons by looking for specific icons or text
        const buttons = commentContainer.querySelectorAll('button, [role="button"], div[tabindex="0"]');
        for (const button of buttons) {
            const text = (button.textContent || '').toLowerCase();
            const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
            const title = (button.getAttribute('title') || '').toLowerCase();
            
            if (text.includes('attach') || text.includes('photo') || text.includes('image') || text.includes('media') ||
                ariaLabel.includes('attach') || ariaLabel.includes('photo') || ariaLabel.includes('image') || ariaLabel.includes('media') ||
                title.includes('attach') || title.includes('photo') || title.includes('image') || title.includes('media')) {
                console.log('📎 Found potential attachment button by text/aria-label');
                return button;
            }
            
            // Look for camera/attachment icons
            const svgs = button.querySelectorAll('svg, i, span[class*="icon"]');
            for (const svg of svgs) {
                let classes = '';
                try {
                    // Безопасное получение className для разных типов элементов
                    if (svg.className) {
                        if (typeof svg.className === 'string') {
                            classes = svg.className.toLowerCase();
                        } else if (svg.className.baseVal !== undefined) {
                            // SVG элементы имеют className.baseVal
                            classes = svg.className.baseVal.toLowerCase();
                        } else if (svg.getAttribute) {
                            classes = (svg.getAttribute('class') || '').toLowerCase();
                        }
                    }
                } catch (e) {
                    // Fallback - попробуем через getAttribute
                    try {
                        classes = (svg.getAttribute('class') || '').toLowerCase();
                    } catch (e2) {
                        classes = '';
                    }
                }
                
                const svgContent = (svg.innerHTML || '').toLowerCase();
                
                if (classes.includes('camera') || classes.includes('attach') || classes.includes('photo') ||
                    svgContent.includes('camera') || svgContent.includes('attach')) {
                    console.log('📎 Found attachment button by icon');
                    return button;
                }
            }
        }
        
        console.log('❌ No media attachment area found');
        return null;
    }

    async uploadFilesToInput(fileInput) {
        try {
            if (fileInput.tagName.toLowerCase() === 'input' && fileInput.type === 'file') {
                // Direct file input - convert base64 files to File objects
                const files = await this.convertBase64ToFiles();
                if (files.length === 0) return false;
                
                // Create FileList-like object
                const dataTransfer = new DataTransfer();
                files.forEach(file => dataTransfer.items.add(file));
                
                fileInput.files = dataTransfer.files;
                
                // Trigger change event
                const changeEvent = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(changeEvent);
                
                console.log(`✅ Uploaded ${files.length} files via file input`);
                return true;
                
            } else {
                // It's a button - click it and then handle the file dialog
                console.log(`📎 Clicking attachment button: ${fileInput.tagName} with text="${fileInput.textContent.trim()}" aria="${fileInput.getAttribute('aria-label') || ''}"`);
                await this.humanClick(fileInput);
                await this.sleep(2000); // Увеличиваем время ожидания для диалога
                
                // Look for the file input that should appear
                console.log('📎 Looking for file input after button click...');
                const allFileInputs = document.querySelectorAll('input[type="file"]');
                console.log(`📎 Found ${allFileInputs.length} file inputs on page:`);
                allFileInputs.forEach((input, i) => {
                    const style = window.getComputedStyle(input);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                    console.log(`📎 File input ${i}: visible=${isVisible}, display=${style.display}, accept="${input.accept}"`);
                });
                
                const newFileInput = document.querySelector('input[type="file"]:not([style*="display: none"])');
                if (newFileInput) {
                    console.log('✅ Found visible file input, using it...');
                    return await this.uploadFilesToInput(newFileInput);
                } else {
                    console.log('⚠️ No visible file input appeared after clicking button');
                    console.log('📎 Trying alternative approaches...');
                    
                    // Попытка 1: Поиск скрытого file input и его имитация
                    const hiddenFileInput = document.querySelector('input[type="file"][style*="display: none"], input[type="file"][hidden]');
                    if (hiddenFileInput) {
                        console.log('📎 Found hidden file input, trying to use it...');
                        try {
                            const files = await this.convertBase64ToFiles();
                            if (files.length > 0) {
                                const dataTransfer = new DataTransfer();
                                files.forEach(file => dataTransfer.items.add(file));
                                hiddenFileInput.files = dataTransfer.files;
                                
                                // Trigger events
                                hiddenFileInput.dispatchEvent(new Event('change', { bubbles: true }));
                                hiddenFileInput.dispatchEvent(new Event('input', { bubbles: true }));
                                
                                console.log('✅ Used hidden file input');
                                return true;
                            }
                        } catch (error) {
                            console.log('❌ Hidden file input approach failed:', error);
                        }
                    }
                    
                    // Попытка 2: Drag and drop на модальном окне
                    console.log('📎 Trying drag and drop on modal...');
                    const modal = document.querySelector('dialog, [role="dialog"], [aria-modal="true"]');
                    const target = modal || fileInput;
                    return await this.simulateDragAndDrop(target);
                }
            }
        } catch (error) {
            console.error('❌ Error uploading files to input:', error);
            return false;
        }
    }

    async simulateDragAndDrop(targetElement) {
        try {
            console.log('📎 Simulating drag and drop for media files...');
            
            const files = await this.convertBase64ToFiles();
            if (files.length === 0) {
                console.log('❌ No files to upload in drag and drop');
                return false;
            }
            
            console.log(`📎 Converting ${files.length} files for drag and drop:`);
            files.forEach((file, i) => {
                console.log(`📎 File ${i}: ${file.name} (${file.type}, ${(file.size/1024).toFixed(1)}KB)`);
            });
            
            // Create drag and drop events
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            
            // Find the best drop target - try multiple approaches
            const possibleTargets = [
                targetElement.querySelector('textarea, [contenteditable="true"]'), // Text input area
                targetElement.querySelector('[role="textbox"]'), // Textbox role
                targetElement.closest('[role="dialog"]'), // Modal dialog
                targetElement.closest('form'), // Form container
                targetElement // Original target
            ].filter(Boolean);
            
            const dropTarget = possibleTargets[0] || targetElement;
            console.log(`📎 Using drop target: ${dropTarget.tagName} with classes="${dropTarget.className}"`);
            
            // Simulate drag and drop sequence with more events
            const events = [
                new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }),
                new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }),
                new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }),
                new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer })
            ];
            
            for (const event of events) {
                console.log(`📎 Dispatching ${event.type} event`);
                dropTarget.dispatchEvent(event);
                await this.sleep(200);
            }
            
            // Try additional events on the comment input if different from drop target
            const commentInput = document.querySelector('[contenteditable="true"][role="textbox"]');
            if (commentInput && commentInput !== dropTarget) {
                console.log('📎 Also trying drag and drop on comment input');
                const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer });
                commentInput.dispatchEvent(dropEvent);
            }
            
            console.log(`✅ Simulated drag and drop for ${files.length} files`);
            return true;
            
        } catch (error) {
            console.error('❌ Error in drag and drop simulation:', error);
            return false;
        }
    }

    async getNextMediaFile() {
        try {
            const selectedFiles = this.settings.selectedMediaFiles || [];
            console.log(`📎 Getting next media file from ${selectedFiles.length} available files`);
            
            if (selectedFiles.length === 0) {
                console.log('⚠️ No media files selected');
                return null;
            }

            let fileToUse = null;

            if (this.settings.randomMediaOrder) {
                // Случайный выбор
                const randomIndex = Math.floor(Math.random() * selectedFiles.length);
                fileToUse = selectedFiles[randomIndex];
                console.log(`📎 Selected random file: ${fileToUse.name} (index ${randomIndex})`);
            } else {
                // Используем первый файл в списке
                fileToUse = selectedFiles[0];
                console.log(`📎 Selected first file: ${fileToUse.name}`);
            }

            return fileToUse;
        } catch (error) {
            console.error('❌ Error getting next media file:', error);
            return null;
        }
    }

    async removeMediaFile(fileMeta) {
        try {
            console.log(`📎 Removing media file: ${fileMeta.name}`);
            
            // Удаляем из настроек
            const selectedFiles = this.settings.selectedMediaFiles || [];
            const updatedFiles = selectedFiles.filter(file => file.id !== fileMeta.id);
            
            // Удаляем данные файла из local storage
            if (fileMeta.id) {
                const key = `mediaFile_${fileMeta.id}`;
                await chrome.storage.local.remove([key]);
                console.log(`📎 Removed file data from storage: ${key}`);
            }

            // Обновляем настройки
            await chrome.storage.sync.set({ selectedMediaFiles: updatedFiles });
            this.settings.selectedMediaFiles = updatedFiles;
            
            console.log(`✅ Media file removed. ${updatedFiles.length} files remaining`);
            return true;
        } catch (error) {
            console.error('❌ Error removing media file:', error);
            return false;
        }
    }

    async convertBase64ToFiles() {
        try {
            const nextFile = await this.getNextMediaFile();
            
            if (!nextFile) {
                console.log('⚠️ No media file to convert');
                return [];
            }

            console.log(`📎 Converting single file: ${nextFile.name}`);
            
            try {
                let fileData = null;
                
                // Если у файла есть ID, загружаем данные из local storage
                if (nextFile.id) {
                    const key = `mediaFile_${nextFile.id}`;
                    console.log(`📎 Loading file data for: ${nextFile.name} from key: ${key}`);
                    const result = await chrome.storage.local.get([key]);
                    if (result[key]) {
                        fileData = {
                            ...nextFile,
                            data: result[key]
                        };
                        console.log(`✅ Loaded file data: ${(result[key].length/1024).toFixed(1)}KB`);
                    } else {
                        console.warn(`⚠️ No data found in storage for key: ${key}`);
                        return [];
                    }
                } else if (nextFile.data) {
                    // Fallback для старого формата (если data уже в метаданных)
                    console.log('📎 Using file data from metadata (old format)');
                    fileData = nextFile;
                }
                
                if (!fileData || !fileData.data) {
                    console.warn(`⚠️ No data found for file: ${nextFile.name}`);
                    return [];
                }
                
                // Convert base64 data URL to blob
                const response = await fetch(fileData.data);
                const blob = await response.blob();
                
                // Create File object
                const file = new File([blob], fileData.name, {
                    type: fileData.type || blob.type,
                    lastModified: Date.now()
                });
                
                console.log(`✅ Converted file: ${fileData.name} (${(blob.size/1024).toFixed(1)}KB, ${file.type})`);
                
                // Проверяем настройки удаления файлов
                if (this.settings.useAllMediaFiles) {
                    // Если включено "циклично использовать", НЕ удаляем файлы
                    console.log('📎 Cyclic use is enabled, keeping file for reuse');
                } else if (this.settings.deleteMediaAfterUse) {
                    // Если включено удаление после использования, удаляем файл
                    console.log('📎 Delete after use is enabled, removing file from storage...');
                    await this.removeMediaFile(nextFile);
                } else {
                    // По умолчанию не удаляем
                    console.log('📎 Keeping file (default behavior)');
                }
                
                return [file]; // Возвращаем массив с одним файлом
                
            } catch (fileError) {
                console.error(`❌ Error converting file ${nextFile.name}:`, fileError);
                return [];
            }
            
        } catch (error) {
            console.error('❌ Error converting base64 to files:', error);
            return [];
        }
    }

    decideActions() {
        const actions = [];
        
        // Add actions based on settings - return ALL enabled actions
        if (this.settings.autoLike) {
            actions.push('like');
        }
        
        if (this.settings.autoComment) {
            actions.push('comment');
        }

        // First-comment mode enforces comment priority if enabled
        // 🚧 Режим "Первый комментарий" временно отключен в разработке
        if (false && this.settings.enableFirstCommentMode && this.settings.firstCommentPriority) {
            this.isFirstCommentMode = true;
            if (!actions.includes('comment')) actions.push('comment');
        } else {
            this.isFirstCommentMode = false;
        }
        
        // If no actions enabled, default to comment for testing
        if (actions.length === 0) {
            console.log('No actions enabled in settings, defaulting to comment');
            return ['comment'];
        }
        
        console.log(`Available actions: [${actions.join(', ')}], will execute all: ${actions.join(' + ')}`);
        
        return actions;
    }
    async postComment(post) {
        try {
            console.log('Attempting to post comment...');
            const postId = this.getPostId(post);
            
            // Check if media files are enabled to determine mode
            const useModalMode = this.settings.enableAttachMedia && this.settings.selectedMediaFiles && this.settings.selectedMediaFiles.length > 0;
            console.log(`📎 Comment mode: ${useModalMode ? 'Modal (with media)' : 'Fast (no media)'}`);
            
            // Find comment button
            const commentButton = this.findCommentButton(post);
            if (!commentButton) {
                console.log('Comment button not found');
                return false;
            }
            
            // Click comment button
            await this.humanClick(commentButton);
            
            // Adaptive delays based on media mode
            if (useModalMode) {
                await this.sleep(2000); // Longer wait for comment form to appear
                // Wait for modal to appear automatically after reply click
                await this.sleep(3000); // Wait for modal to fully open with all buttons
            } else {
                await this.sleep(800); // Faster for non-modal mode
                await this.sleep(1200); // Reduced wait time
            }
            
            // Verify modal opened (only necessary for media mode)
            if (useModalMode) {
                const modal = document.querySelector('dialog, [role="dialog"], [aria-modal="true"]');
                if (modal) {
                    console.log('✅ Modal window opened successfully after reply click');
                } else {
                    console.log('⚠️ Modal window not found, trying to find expand constructor button...');
                    // Fallback: Look for expand constructor button
                    const expandButton = await this.findExpandConstructorButton();
                    if (expandButton) {
                        console.log('🔧 Found expand constructor button, clicking to open full modal...');
                        await this.humanClick(expandButton);
                        await this.sleep(2500);
                    }
                }
            } else {
                console.log('⚡ Fast mode: skipping modal verification');
            }
            
            // Find comment input
            const commentInput = this.findCommentInput();
            if (!commentInput) {
                console.log('Comment input not found');
                return false;
            }
            
            // Select random comment / or AI prompt specialization for first-comment
            // AGGRESSIVELY clear any existing text first to avoid accumulation  
            console.log('Clearing existing text in comment input...');
            
            // Focus the element first
            commentInput.focus();
            await this.sleep(useModalMode ? 300 : 150);
            
            // Modern clearing methods
            if (commentInput.contentEditable === 'true') {
                // Use modern approach
                commentInput.textContent = '';
                commentInput.innerHTML = '';
                
                // Method 2: Clear properties
                commentInput.innerHTML = '';
                commentInput.textContent = '';
                commentInput.innerText = '';
                
                // Method 3: Send backspace events
                for (let i = 0; i < 10; i++) {
                    const backspaceEvent = new KeyboardEvent('keydown', {
                        key: 'Backspace', code: 'Backspace', keyCode: 8, which: 8, bubbles: true
                    });
                    commentInput.dispatchEvent(backspaceEvent);
                }
            } else {
                commentInput.value = '';
                commentInput.select();
            }
            
            // Trigger clear events
            const events = [
                new Event('input', { bubbles: true }), 
                new Event('change', { bubbles: true }),
                new KeyboardEvent('keyup', { bubbles: true })
            ];
            
            for (const event of events) {
                commentInput.dispatchEvent(event);
                await this.sleep(useModalMode ? 50 : 25);
            }
            
            await this.sleep(useModalMode ? 500 : 250);
            console.log(`After clearing, field content: "${commentInput.textContent || commentInput.value || ''}"`);
            
            // Verify field is actually empty
            const currentContent = commentInput.textContent || commentInput.value || '';
            if (currentContent.length > 0) {
                console.warn(`⚠️ Field still has content after clearing: "${currentContent}"`);
                // Force clear one more time
                commentInput.innerHTML = '';
                commentInput.textContent = '';
                if (commentInput.value !== undefined) commentInput.value = '';
            }
            
            // Generate comment text with optional first-comment prompt
            let comment;
            // Pre-extract post text once to avoid missing text due to UI changes
            const preExtractedText = this.extractPostText(post);
            // 🚧 Режим "Первый комментарий" временно отключен в разработке
            if (false && this.settings.enableAI && this.settings.enableFirstCommentMode && this.settings.firstCommentPrompt) {
                const originalPrompt = this.settings.aiPrompt;
                try {
                    this.settings.aiPrompt = this.settings.firstCommentPrompt;
                    comment = await this.generateComment(post);
                    
                    // Validate comment length for first-comment mode
                    const maxLength = this.settings.firstCommentMaxLength || 140;
                    if (comment && comment.length > maxLength) {
                        console.log(`⚠️ First comment too long (${comment.length} > ${maxLength}), truncating...`);
                        comment = comment.substring(0, maxLength - 3).trim() + '...';
                    }
                } finally {
                    this.settings.aiPrompt = originalPrompt;
                }
            } else {
                comment = await this.generateComment(post, preExtractedText);
            }
            console.log(`Generated comment: "${comment}"`);
            
            // Type comment with human-like typing simulation if stealth mode is enabled
            console.log(`🥷 Статус скрытного режима: ${this.settings.stealthMode}`);
            if (this.settings.stealthMode) {
                console.log('🎯 Using humanType (stealth mode enabled)');
                await this.humanType(commentInput, comment);
            } else {
                console.log('⚡ Using instantType (stealth mode disabled)');
                await this.instantType(commentInput, comment);
            }
            await this.sleep(useModalMode ? 1000 : 500);
            
            // Handle media attachment if enabled
            if (this.settings.enableAttachMedia && this.settings.selectedMediaFiles && this.settings.selectedMediaFiles.length > 0) {
                console.log('📎 Attaching media files to comment...');
                await this.attachMediaFiles(commentInput);
            }
            
            // Wait a bit more for the submit button to appear (it shows up after typing)
            console.log('Waiting for submit button to appear...');
            await this.sleep(useModalMode ? 1500 : 800);
            
            // Check if the input still exists and has our text
            const currentText = (commentInput.textContent || commentInput.value || commentInput.innerText || '').trim();
            console.log(`Current text in input: "${currentText}"`);
            if (currentText.length === 0) {
                console.log('⚠️ Input seems to have lost text, trying to re-type...');
                console.log(`🥷 Повтор со скрытным режимом: ${this.settings.stealthMode}`);
                if (this.settings.stealthMode) {
                    console.log('🎯 Retry using humanType (stealth mode enabled)');
                    await this.humanType(commentInput, comment);
                } else {
                    console.log('⚡ Retry using instantType (stealth mode disabled)');
                    await this.instantType(commentInput, comment);
                }
                await this.sleep(useModalMode ? 500 : 300);
                
                // Check again after re-typing
                const retryText = (commentInput.textContent || commentInput.value || commentInput.innerText || '').trim();
                console.log(`After retry, text in input: "${retryText}"`);
            }
            
            // Try multiple times to find the submit button as it might appear with delay
            let submitButton = null;
            for (let attempt = 0; attempt < 3; attempt++) {
                console.log(`Attempt ${attempt + 1} to find submit button...`);
                submitButton = this.findSubmitButton(commentInput);
                if (submitButton) break;
                await this.sleep(useModalMode ? 1000 : 600);
            }
            if (submitButton) {
                // Check if it's the special Enter key fallback
                if (submitButton.useEnterKey && submitButton.element) {
                    console.log('✅ Using Enter key for comment submission...');
                    submitButton.element.focus();
                    await this.sleep(useModalMode ? 200 : 100);
                    
                    // Simulate Enter keypress
                    const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    });
                    submitButton.element.dispatchEvent(enterEvent);
                    
                    await this.sleep(useModalMode ? 200 : 100);
                    
                    // Also try keyup event
                    const enterUpEvent = new KeyboardEvent('keyup', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    });
                    submitButton.element.dispatchEvent(enterUpEvent);
                    
                    console.log('Enter key pressed for comment submission');
                    
                    // Also try Ctrl+Enter as backup
                    await this.sleep(useModalMode ? 500 : 300);
                    const ctrlEnterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        ctrlKey: true,
                        bubbles: true,
                        cancelable: true
                    });
                    submitButton.element.dispatchEvent(ctrlEnterEvent);
                    console.log('Also tried Ctrl+Enter for submission');
                    
                } else {
                // Final validation before clicking submit button
                const buttonText = submitButton.textContent || '';
                const ariaLabel = submitButton.getAttribute('aria-label') || '';
                const isInProfileLink = submitButton.closest('a[href*="/"]') !== null;
                
                // Double-check it's not a profile link or subscribe button
                if (buttonText.includes('beardman') || buttonText.includes('@') || 
                    buttonText.toLowerCase().includes('подписаться') ||
                    buttonText.toLowerCase().includes('subscribe') ||
                    buttonText.toLowerCase().includes('follow') ||
                    ariaLabel.toLowerCase().includes('profile') ||
                    ariaLabel.toLowerCase().includes('подписаться') ||
                    ariaLabel.toLowerCase().includes('subscribe') ||
                    ariaLabel.toLowerCase().includes('follow') ||
                    isInProfileLink) {
                    console.error('❌ CRITICAL: Submit button appears to be a profile/subscribe link! Aborting to prevent wrong action.');
                    console.log(`Button text: "${buttonText.substring(0, 50)}", aria: "${ariaLabel}", isInLink: ${isInProfileLink}`);
                    this.showNotification(this.t('commentError'), 'error');
                    return false;
                }
                
                console.log('✅ Found submit button, clicking it...');
                console.log(`Submit button details: text="${buttonText.substring(0, 30)}" aria="${ariaLabel}" tag=${submitButton.tagName}`);
                await this.humanClick(submitButton);
                console.log('Submit button clicked successfully');
                }
            } else {
                console.error('❌ CRITICAL: No submit button found! Trying Enter key fallback...');
                
                // Try Enter key fallback before giving up
                const commentInput = document.querySelector('[contenteditable="true"]:not(:empty)');
                if (commentInput) {
                    console.log('🔄 Attempting Enter key submission as fallback...');
                    
                    // Focus on the input
                    commentInput.focus();
                    await this.delay(300);
                    
                    // Try different Enter key combinations
                    const enterMethods = [
                        { key: 'Enter', ctrlKey: false, shiftKey: false, name: 'Enter' },
                        { key: 'Enter', ctrlKey: true, shiftKey: false, name: 'Ctrl+Enter' },
                        { key: 'Enter', ctrlKey: false, shiftKey: true, name: 'Shift+Enter' }
                    ];
                    
                    for (const method of enterMethods) {
                        console.log(`Trying ${method.name}...`);
                        
                        const keyEvent = new KeyboardEvent('keydown', {
                            key: method.key,
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            ctrlKey: method.ctrlKey,
                            shiftKey: method.shiftKey,
                            bubbles: true,
                            cancelable: true
                        });
                        
                        commentInput.dispatchEvent(keyEvent);
                        await this.delay(200);
                        
                        // Also try keyup event
                        const keyUpEvent = new KeyboardEvent('keyup', {
                            key: method.key,
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            ctrlKey: method.ctrlKey,
                            shiftKey: method.shiftKey,
                            bubbles: true,
                            cancelable: true
                        });
                        commentInput.dispatchEvent(keyUpEvent);
                        await this.delay(300);
                    }
                    
                    console.log('✅ Attempted Enter key submission methods');
                    
                } else {
                    // Debug: show what elements are available
                    console.log('No comment input found for Enter fallback. Available elements in comment area:');
                    const container = document.querySelector('[role="dialog"], form') || document.body;
                        const allButtons = container.querySelectorAll('button, div[role="button"], [tabindex="0"], svg');
                    console.log(`Found ${allButtons.length} potential buttons/elements:`);
                        
                        allButtons.forEach((el, i) => {
                            if (i < 15) {
                            console.log(`  ${i}: ${el.tagName} - aria:"${el.getAttribute('aria-label') || ''}" text:"${(el.textContent || '').substring(0, 30)}" visible:${this.isVisible(el)}`);
                            }
                        });
                
                this.showNotification(this.t('commentError'), 'error');
                return false;
                }
            }
            
            // Wait a bit to see if comment was posted
            await this.sleep(useModalMode ? 2000 : 1000);
            
            // Note: stats.comments++ moved to processPage action loop
            // Removed notification to reduce spam - use console logging instead
            console.log('Comment posted successfully');
            return true;
            
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showNotification(this.t('commentError'), 'error');
        }
        
        return false;
    }
    async likePost(post) {
        try {
            console.log('Attempting to like post...');
            
            const likeButton = this.findLikeButton(post);
            if (!likeButton) {
                console.log('Like button not found');
                return false;
            }
            
            // Check if already liked
            if (this.isAlreadyLiked(likeButton)) {
                console.log('Post already liked');
                return false;
            }
            
            await this.humanClick(likeButton);
            
            // Note: stats.likes++ moved to processPage action loop
            // Removed notification to reduce spam - use console logging instead
            console.log('Post liked successfully');
            return true;
            
        } catch (error) {
            console.error('Error liking post:', error);
            this.showNotification(this.t('likeError'), 'error');
        }
        
        return false;
    }

    findCommentButton(post) {
        console.log('=== DEBUG: Looking for comment button ===');
        
        // First try the specific selector for comment button
        const specificCommentButton = document.querySelector('#barcelona-page-layout > div > div > div.xb57i2i.x1q594ok.x5lxg6s.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.x1l7klhg.xs83m0k.x2lwn1j.xx8ngbg.xwo3gff.x1oyok0e.x1odjw0f.x1n2onr6.xq1qtft.xz401s1.x195bbgf.xgb0k9h.x1l19134.xgjo3nb.x1ga7v0g.x15mokao.x18b5jzi.x1q0q8m5.x1t7ytsu.x1ejq31n.xt8cgyo.x128c8uf.x1co6499.xc5fred.x1ma7e2m.x9f619.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.xy5w88m.xh8yej3.xbwb3hm.xgh35ic.x19xvnzb.x87ppg5.xev1tu8.xpr2fh2.xgzc8be.x1y1aw1k > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6 > div.x1c1b4dv.x13dflua.x11xpdln > div > div.x78zum5.xdt5ytf.x1iyjqo2.x1n2onr6 > div:nth-child(3) > div > div > div > div > div.x49hn82.xcrlgei.xz9dl7a.xsag5q8 > div > div > div.x78zum5.xdt5ytf.x120eax6.xh8yej3 > div > div.xuk3077.x78zum5.xdt5ytf.x1qughib.x1yrsyyn > div');
        
        if (specificCommentButton && this.isVisible(specificCommentButton)) {
            console.log('✅ Found specific comment button using provided selector');
            return specificCommentButton;
        }
        
        // First try to find all interactive elements in the post
        const allInteractive = post.querySelectorAll('div[role="button"], button, svg, [tabindex="0"]');
        console.log(`Found ${allInteractive.length} interactive elements in post`);
        
        // Look for comment buttons by text content and aria-label
        for (let i = 0; i < allInteractive.length; i++) {
            const element = allInteractive[i];
            const ariaLabel = element.getAttribute('aria-label') || '';
            const title = element.getAttribute('title') || '';
            const text = element.textContent?.trim() || '';
            
            console.log(`Interactive ${i}: ${element.tagName} - aria: "${ariaLabel}" - text: "${text.substring(0, 50)}"`);
            
            // Check for comment/reply indicators
            if (ariaLabel.includes('Ответ') || ariaLabel.includes('Reply') || ariaLabel.includes('Comment') ||
                ariaLabel.includes('Відповісти') ||  // Ukrainian
                text.includes('Ответ') || text.includes('Reply') || text.includes('Comment') ||
                text.includes('Відповісти') ||  // Ukrainian
                ariaLabel.includes('ответ')) {
                
                console.log(`✅ Found potential comment button: ${element.tagName} - "${ariaLabel || text}"`);
                
                // If it's an SVG, return the clickable parent
                if (element.tagName === 'SVG' && element.parentElement) {
                    console.log(`Returning SVG parent: ${element.parentElement.tagName}`);
                    return element.parentElement;
                }
                
                return element;
            }
        }
        
        // Fallback: try simpler selectors
        const selectors = [
            '[aria-label*="Ответ"]',
            '[aria-label*="Reply"]',
            '[aria-label*="Відповісти"]',  // Ukrainian
            'svg[aria-label*="Ответ"]',
            'svg[aria-label*="Reply"]',
            'svg[aria-label*="Відповісти"]'  // Ukrainian
        ];
        
        for (const selector of selectors) {
            const elements = post.querySelectorAll(selector);
            console.log(`Selector "${selector}" found ${elements.length} elements`);
            
            for (const button of elements) {
                // Check if this looks like a comment/reply button
                const ariaLabel = button.getAttribute('aria-label') || '';
                const title = button.getAttribute('title') || '';
                const text = button.textContent?.trim() || '';
                
                if (ariaLabel.toLowerCase().includes('reply') || 
                    ariaLabel.toLowerCase().includes('comment') ||
                    ariaLabel.toLowerCase().includes('ответ') ||
                    ariaLabel.toLowerCase().includes('відповісти') ||  // Ukrainian
                    title.toLowerCase().includes('reply') ||
                    title.toLowerCase().includes('comment') ||
                    text.toLowerCase().includes('reply') ||
                    text.toLowerCase().includes('відповісти')) {  // Ukrainian
                    
                    console.log(`✅ Found comment button: ${selector} - "${ariaLabel || title || text}"`);
                    
                    // If it's an SVG, return the clickable parent
                    if (button.tagName === 'SVG' && button.parentElement) {
                        console.log(`Returning SVG parent: ${button.parentElement.tagName}`);
                        return button.parentElement;
                    }
                    
                    return button;
                }
            }
        }
        
        console.log('❌ No comment button found with any selector');
        return null;
    }

    findCommentInput() {
        const selectors = [
            // Threads.com specific - more comprehensive search
            'div[contenteditable="true"][aria-label*="Reply"]',
            'div[contenteditable="true"][aria-label*="reply"]',
            'div[contenteditable="true"][aria-label*="Ответ"]',
            'div[contenteditable="true"][aria-label*="ответ"]',
            'div[contenteditable="true"][aria-label*="Відповісти"]',  // Ukrainian
            'div[contenteditable="true"][role="textbox"]',
            'textarea[placeholder*="Reply"]',
            'textarea[placeholder*="reply"]',
            'textarea[placeholder*="Write a reply"]',
            'textarea[placeholder*="Написать ответ"]',
            'textarea[placeholder*="Написати відповідь"]',  // Ukrainian
            'div[aria-label*="текстовое поле"]',
            'div[aria-label*="создать новую публикацию"]',
            
            // Look for any contenteditable that appeared recently
            'div[contenteditable="true"], span[contenteditable="true"], p[contenteditable="true"]',
            
            // Generic selectors
            'textarea[placeholder*="comment"], textarea[aria-label*="comment"], input[placeholder*="comment"]',
            'textarea[aria-describedby*="reply"], div[data-testid*="reply-input"], div[role="textbox"]',
            
            // Fallback - ANY editable field
            'textarea, input[type="text"]'
        ];
        
        console.log('🔍 Searching for comment input...');
        
        for (const selector of selectors) {
            const inputs = document.querySelectorAll(selector);
            console.log(`Selector "${selector}" found ${inputs.length} elements`);
            
            for (const input of inputs) {
                if (this.isVisible(input) && input.offsetHeight > 0 && input.offsetWidth > 0) {
                    const ariaLabel = input.getAttribute('aria-label') || '';
                    const placeholder = input.getAttribute('placeholder') || '';
                    const text = input.textContent || input.value || '';
                    
                    // Additional check - make sure it's focusable
                    try {
                        input.focus();
                        console.log(`✅ Found and focused comment input: ${input.tagName} aria:"${ariaLabel}" placeholder:"${placeholder}" text:"${text.substring(0, 30)}"`);
                        return input;
                    } catch (e) {
                        console.log(`⚠️ Found input but couldn't focus: ${e.message}`);
                        continue;
                    }
                }
            }
        }
        
        // Last resort: look for any recently added editable elements
        console.log('🔍 Last resort: searching for ANY recently focused editable elements...');
        const allEditable = document.querySelectorAll('[contenteditable="true"], textarea, input[type="text"]');
        for (const elem of allEditable) {
            if (this.isVisible(elem) && elem.offsetHeight > 10 && elem.offsetWidth > 50) {
                try {
                    elem.focus();
                    console.log(`✅ Last resort found: ${elem.tagName} - ${elem.className}`);
                    return elem;
                } catch (e) {
                    continue;
                }
            }
        }
        
        console.log('❌ No visible comment input found');
        return null;
    }
    findSubmitButton(providedCommentInput = null) {
        console.log('=== DEBUG: Looking for submit button (round arrow button) ===');
        
        // Strategy 1: Find "Опубликовать" / "Post" button in a modal
        const modalSubmitButtons = Array.from(document.querySelectorAll('div[role="dialog"] button, div[role="dialog"] div[role="button"]'));
        if (modalSubmitButtons.length > 0) {
            const publishButton = modalSubmitButtons.find(btn => 
                (btn.innerText.trim().toLowerCase() === 'опубликовать' || btn.innerText.trim().toLowerCase() === 'post') &&
                this.isVisible(btn)
            );
            if (publishButton) {
                console.log('✅ Found modal "Опубликовать"/"Post" button:', publishButton);
                return publishButton;
            }
        }
        
        // First, check if there are any filled comment inputs
        const commentInputs = document.querySelectorAll('[contenteditable="true"], textarea');
        let hasFilledInput = false;
        
        // If we have a specific comment input, check it first
        if (providedCommentInput) {
            const text = (providedCommentInput.textContent || providedCommentInput.value || providedCommentInput.innerText || '').trim();
            if (text.length > 0) {
                hasFilledInput = true;
                console.log(`Found provided comment input with text: "${text.substring(0, 50)}"`);
            } else {
                // Even if empty, still try to find submit button near this input
                console.log('Provided input seems empty, but will still search for submit button near it');
                hasFilledInput = true; // Force search even if empty
            }
        }
        
        // If no provided input or it's empty, check all inputs
        if (!hasFilledInput) {
            for (const input of commentInputs) {
                const text = (input.textContent || input.value || input.innerText || '').trim();
                if (text.length > 0) {
                    hasFilledInput = true;
                    console.log(`Found filled comment input with text: "${text.substring(0, 50)}"`);
                    break;
                }
            }
        }
        
        // Be less strict about filled inputs - if we have a comment dialog open, try to find submit
        if (!hasFilledInput && commentInputs.length > 0) {
            console.log('No filled inputs found, but comment dialog seems open - trying to find submit button anyway');
            hasFilledInput = true;
        }
        
        if (!hasFilledInput) {
            console.log('❌ No comment inputs found at all - submit button likely not available');
            return null;
        }
        
        // Priority 0: Try the exact submit button selectors first!
        console.log('Trying known submit button selectors...');
        
        // Try the specific SVG submit button first (most accurate)
        const submitButtonSvg = document.querySelector('div.x1i10hfl.xjqpnuy.xc5r6h4.xqeqjp1.x1phubyo.x13fuv20.x18b5jzi.x1q0q8m5.x1t7ytsu.x972fbf.x10w94by.x1qhh985.x14e42zd.x1ypdohk.xdl72j9.x2lah0s.x3ct3a4.xdj266r.x14z9mp.xat24cr.x1lziwak.x2lwn1j.xeuugli.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x1lku1pv.x1a2a7pz.x6s0dn4.x9f619.x3nfvp2.x1s688f.xl56j7k.x87ps6o.xuxw1ft.x111bo7f.x1c9tyrk.xeusxvb.x1pahc9y.x1ertn4p.x10w6t97.xx6bhzk.x12w9bfk.x11xpdln.x1td3qas.xd3so5o.x1lcra6a > span > svg');
        
        if (submitButtonSvg && this.isVisible(submitButtonSvg)) {
            const parentButton = submitButtonSvg.closest('div[role="button"], button') || submitButtonSvg.parentElement;
            if (parentButton && this.isVisible(parentButton)) {
                console.log(`✅ Found exact submit button SVG: ${submitButtonSvg.tagName} in ${parentButton.tagName}`);
                return parentButton;
            }
        }
        
        // Try alternative selectors for the submit button container
        const submitSelectors = [
            'div.x1i10hfl.xjqpnuy.xc5r6h4.xqeqjp1.x1phubyo.x13fuv20.x18b5jzi.x1q0q8m5.x1t7ytsu.x972fbf.x10w94by.x1qhh985.x14e42zd.x1ypdohk.xdl72j9.x2lah0s.x3ct3a4.xdj266r.x14z9mp.xat24cr.x1lziwak.x2lwn1j.xeuugli.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x1lku1pv.x1a2a7pz.x6s0dn4.x9f619.x3nfvp2.x1s688f.xl56j7k.x87ps6o.xuxw1ft.x111bo7f.x1c9tyrk.xeusxvb.x1pahc9y.x1ertn4p.x10w6t97.xx6bhzk.x12w9bfk.x11xpdln.x1td3qas.xd3so5o.x1lcra6a',
            'div.x1i10hfl.xjqpnuy.xc5r6h4.xqeqjp1.x1phubyo.x13fuv20.x18b5jzi.x1q0q8m5.x1t7ytsu.x972fbf.x10w94by.x1qhh985.x14e42zd.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x14z9mp.xat24cr.x1lziwak.x2lwn1j.xeuugli.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x1lku1pv.x1a2a7pz.x6s0dn4.x9f619.x3nfvp2.x1s688f.xl56j7k.x87ps6o.xuxw1ft.x111bo7f.x1c9tyrk.xeusxvb.x1pahc9y.x1ertn4p.x10w6t97.xx6bhzk.x12w9bfk.x11xpdln.x1td3qas.xd3so5o.x1lcra6a'
        ];
        
        for (const selector of submitSelectors) {
            const knownSubmitButton = document.querySelector(selector);
        if (knownSubmitButton && this.isVisible(knownSubmitButton)) {
                // Verify it's not a subscribe button
                const buttonText = knownSubmitButton.textContent || '';
                const isSubscribeButton = buttonText.toLowerCase().includes('подписаться') || 
                                       buttonText.toLowerCase().includes('subscribe') ||
                                       buttonText.toLowerCase().includes('follow');
                
                if (!isSubscribeButton) {
                    console.log(`✅ Found known submit button: ${knownSubmitButton.tagName} with text="${buttonText.substring(0, 20)}"`);
            return knownSubmitButton;
        } else {
                    console.log(`⚠️ Skipping subscribe button: ${knownSubmitButton.tagName} with text="${buttonText.substring(0, 20)}"`);
                }
            }
        }
        
        console.log(`Known submit buttons not found or not visible.`);
        
        // Priority 0.5: Try to find submit button by looking for elements containing arrow SVG or specific patterns
        console.log('Looking for submit button with arrow icon or post-like characteristics...');
        
        // First, let's find the specific comment input that has our text
        let targetCommentInput = providedCommentInput;
        if (!targetCommentInput) {
            const commentInputs = document.querySelectorAll('[contenteditable="true"], [role="textbox"]');
            for (const input of commentInputs) {
                const text = (input.textContent || input.value || '').trim();
                if (text.length > 5) {
                    targetCommentInput = input;
                    console.log(`Found target comment input with text: "${text.substring(0, 50)}"`);
                    break;
                }
            }
        }
        
        if (targetCommentInput) {
            // Look for submit button in the same container as comment input
            let container = targetCommentInput.closest('[role="dialog"], form, .comment-composer, [data-testid*="composer"]') || 
                          targetCommentInput.parentElement;
            
            // Go up a few levels to find the comment composer container
            for (let i = 0; i < 5 && container && container !== document.body; i++) {
                container = container.parentElement;
                
                // Look for submit buttons within this container
                const submitCandidates = container.querySelectorAll([
                    'button[type="submit"]',
                    '[role="button"]',
                    'div[role="button"]',
                    'button'
                ].join(', '));
                
                for (const candidate of submitCandidates) {
                    if (!this.isVisible(candidate)) continue;
                    
                    // Check if button contains arrow SVG or submit-like characteristics
                    const buttonText = candidate.textContent || '';
                    const ariaLabel = candidate.getAttribute('aria-label') || '';
                    const hasSvg = candidate.querySelector('svg') !== null;
                    
                    // Look for specific characteristics of submit button
                    const isSubmitButton = (
                        // Has arrow SVG and minimal/no text (common for submit buttons)
                        (hasSvg && buttonText.trim().length < 5) ||
                        // Contains submit-related text
                        buttonText.toLowerCase().includes('post') ||
                        buttonText.toLowerCase().includes('reply') ||
                        buttonText.toLowerCase().includes('отправить') ||
                        ariaLabel.toLowerCase().includes('post') ||
                        ariaLabel.toLowerCase().includes('reply') ||
                        ariaLabel.toLowerCase().includes('submit') ||
                        // Is a button with type submit
                        candidate.getAttribute('type') === 'submit'
                    );
                    
                    if (isSubmitButton) {
                        // Double-check it's not a profile/user link or subscribe button
                        const isUserLink = (
                            buttonText.includes('beardman') ||
                            buttonText.includes('@') ||
                            buttonText.toLowerCase().includes('подписаться') ||
                            buttonText.toLowerCase().includes('subscribe') ||
                            buttonText.toLowerCase().includes('follow') ||
                            candidate.closest('a[href*="/"]') !== null ||
                            ariaLabel.toLowerCase().includes('profile') ||
                            ariaLabel.toLowerCase().includes('user') ||
                            ariaLabel.toLowerCase().includes('подписаться') ||
                            ariaLabel.toLowerCase().includes('subscribe') ||
                            ariaLabel.toLowerCase().includes('follow')
                        );
                        
                        if (!isUserLink) {
                            console.log(`✅ Found potential submit button: ${candidate.tagName} with text="${buttonText.substring(0, 30)}" aria="${ariaLabel}" svg=${hasSvg}`);
                            return candidate;
                        } else {
                            console.log(`⚠️ Skipping user link: ${candidate.tagName} with text="${buttonText.substring(0, 30)}"`);
                        }
                    }
                }
            }
        }
        
        // Fallback: Try key class combinations but with better filtering
        const keySelectors = [
            'div.x1i10hfl.x1t7ytsu.x972fbf',                    // Key submit classes
            'div.x1i10hfl.xjqpnuy.xc5r6h4',                    // Button start classes  
            '.x1i10hfl.x1t7ytsu[role="button"]',               // Button with key classes
            '[role="button"].x1i10hfl.x972fbf',                // Role + classes
        ];
        
        for (const selector of keySelectors) {
            console.log(`Trying key selector: ${selector}`);
            const buttons = document.querySelectorAll(selector);
            console.log(`Found ${buttons.length} elements with selector: ${selector}`);
            
            for (const button of buttons) {
                if (this.isVisible(button)) {
                    const buttonText = button.textContent || '';
                    const ariaLabel = button.getAttribute('aria-label') || '';
                    
                    // Skip if it looks like a user profile link or subscribe button
                    if (buttonText.includes('beardman') || buttonText.includes('@') || 
                        buttonText.toLowerCase().includes('подписаться') ||
                        buttonText.toLowerCase().includes('subscribe') ||
                        buttonText.toLowerCase().includes('follow') ||
                        ariaLabel.toLowerCase().includes('profile') ||
                        ariaLabel.toLowerCase().includes('подписаться') ||
                        ariaLabel.toLowerCase().includes('subscribe') ||
                        ariaLabel.toLowerCase().includes('follow') ||
                        button.closest('a[href*="/"]')) {
                        console.log(`⚠️ Skipping user link/subscribe button: "${buttonText.substring(0, 30)}"`);
                        continue;
                    }
                    
                    // Check if it's near our comment input
                    const nearbyInputs = document.querySelectorAll('[contenteditable="true"]');
                    for (const input of nearbyInputs) {
                        const inputText = input.textContent || '';
                        if (inputText.length > 5) { // Has text
                            const inputRect = input.getBoundingClientRect();
                            const buttonRect = button.getBoundingClientRect();
                            const distance = Math.abs(inputRect.top - buttonRect.top) + Math.abs(inputRect.left - buttonRect.left);
                            
                            // Prefer buttons with SVG (likely submit) and closer to input
                            const hasSvg = button.querySelector('svg') !== null;
                            const maxDistance = hasSvg ? 300 : 200; // Closer for non-SVG buttons
                            
                            // Additional check: prefer buttons with no text or minimal text (arrow buttons)
                            const hasMinimalText = buttonText.trim().length <= 3;
                            const isLikelySubmit = hasSvg && (hasMinimalText || 
                                buttonText.toLowerCase().includes('post') ||
                                buttonText.toLowerCase().includes('reply') ||
                                buttonText.toLowerCase().includes('отправить'));
                            
                            if (distance < maxDistance && isLikelySubmit) {
                                console.log(`✅ Found submit button near comment input: ${selector}, distance: ${distance}px, svg: ${hasSvg}, text: "${buttonText.substring(0, 30)}", minimal: ${hasMinimalText}`);
                                return button;
                            } else if (distance < maxDistance) {
                                console.log(`⚠️ Button near input but doesn't look like submit: text="${buttonText.substring(0, 30)}" svg=${hasSvg} minimal=${hasMinimalText}`);
                            }
                        }
                    }
                }
            }
        }
        
        // Priority 0.8: Search for submit SVG in comment dialog area
        console.log('Searching for submit SVG in active comment dialog...');
        
        if (targetCommentInput) {
            // Look for the specific submit SVG pattern in the comment area
            const commentDialog = targetCommentInput.closest('[role="dialog"], [role="complementary"], .comment-dialog, div') || document;
            
            // Look for SVGs that match the submit button pattern
            const submitSvgs = commentDialog.querySelectorAll('svg');
            console.log(`Found ${submitSvgs.length} SVG elements in comment area`);
            
            for (const svg of submitSvgs) {
                const svgParent = svg.closest('div[role="button"], button, div[tabindex], [onclick]');
                if (!svgParent || !this.isVisible(svgParent)) continue;
                
                // Check if parent has the submit button class pattern
                const parentClasses = svgParent.className || '';
                const hasSubmitClasses = parentClasses.includes('x1i10hfl') && 
                                       parentClasses.includes('x1t7ytsu') && 
                                       parentClasses.includes('x972fbf');
                
                if (hasSubmitClasses) {
                    const parentText = svgParent.textContent || '';
                    const isSubscribeButton = parentText.toLowerCase().includes('подписаться') || 
                                            parentText.toLowerCase().includes('subscribe') ||
                                            parentText.toLowerCase().includes('follow');
                    
                    if (!isSubscribeButton) {
                        // Check if it's near our comment input
                        const inputRect = targetCommentInput.getBoundingClientRect();
                        const buttonRect = svgParent.getBoundingClientRect();
                        const distance = Math.abs(inputRect.bottom - buttonRect.top) + Math.abs(inputRect.right - buttonRect.left);
                        
                        if (distance < 150) { // Close to input
                            console.log(`✅ Found submit SVG button near comment input: distance=${distance.toFixed(1)}px, text="${parentText.substring(0, 20)}"`);
                            return svgParent;
                        }
                    } else {
                        console.log(`⚠️ Skipping subscribe SVG button: "${parentText.substring(0, 20)}"`);
                    }
                }
            }
        }
        
        // Priority 1: Threads-specific submit button search
        console.log('Searching for Threads-specific submit button patterns...');
        
        // In Threads, submit button is often a div with specific classes and an arrow SVG
        // It appears next to or below the comment input
        if (targetCommentInput) {
            const inputRect = targetCommentInput.getBoundingClientRect();
            
            // Look for elements that are positioned near the comment input (below or to the right)
            const allClickables = document.querySelectorAll('[role="button"], button, div[tabindex], [onclick]');
            console.log(`Checking ${allClickables.length} clickable elements for submit button...`);
            
            for (const clickable of allClickables) {
                if (!this.isVisible(clickable)) continue;
                
                const buttonRect = clickable.getBoundingClientRect();
                
                // Check if element is positioned near the comment input
                const verticalDistance = Math.abs(inputRect.bottom - buttonRect.top);
                const horizontalDistance = Math.abs(inputRect.right - buttonRect.left);
                const totalDistance = Math.sqrt(verticalDistance * verticalDistance + horizontalDistance * horizontalDistance);
                
                // Only consider elements that are close to the input
                if (totalDistance > 100) continue;
                
                const buttonText = clickable.textContent || '';
                const ariaLabel = clickable.getAttribute('aria-label') || '';
                const hasSvg = clickable.querySelector('svg') !== null;
                
                // Skip user profile links and other non-submit elements
                const isUserLink = (
                    buttonText.includes('beardman') ||
                    buttonText.includes('@') ||
                    buttonText.toLowerCase().includes('follow') ||
                    buttonText.toLowerCase().includes('подписаться') ||
                    buttonText.toLowerCase().includes('subscribe') ||
                    ariaLabel.toLowerCase().includes('profile') ||
                    ariaLabel.toLowerCase().includes('user') ||
                    ariaLabel.toLowerCase().includes('подписаться') ||
                    ariaLabel.toLowerCase().includes('subscribe') ||
                    ariaLabel.toLowerCase().includes('follow') ||
                    clickable.closest('a[href*="/"]') !== null
                );
                
                if (isUserLink) {
                    console.log(`⚠️ Skipping user link: "${buttonText.substring(0, 30)}" distance: ${totalDistance.toFixed(1)}px`);
                    continue;
                }
                
                // Look for submit button characteristics
                const isLikelySubmit = (
                    // Has SVG (arrow) and minimal text
                    (hasSvg && buttonText.trim().length < 3) ||
                    // Round button with SVG near input
                    (hasSvg && buttonRect.width > 30 && buttonRect.height > 30 && Math.abs(buttonRect.width - buttonRect.height) < 10) ||
                    // Contains submit-related words
                    buttonText.toLowerCase().includes('post') ||
                    buttonText.toLowerCase().includes('reply') ||
                    buttonText.toLowerCase().includes('отправить') ||
                    ariaLabel.toLowerCase().includes('post') ||
                    ariaLabel.toLowerCase().includes('reply') ||
                    ariaLabel.toLowerCase().includes('submit')
                );
                
                if (isLikelySubmit) {
                    console.log(`✅ Found Threads submit button candidate: ${clickable.tagName} text="${buttonText}" svg=${hasSvg} distance=${totalDistance.toFixed(1)}px size=${buttonRect.width}x${buttonRect.height}`);
                    return clickable;
                }
            }
        }
        
        // Priority 1.5: Look for the round submit button that appears after typing
        // This button usually appears near the comment input with an arrow icon
        console.log('Searching for round arrow submit button...');
        
        // Look for SVG arrows that could be submit buttons
        const arrowSvgs = document.querySelectorAll('svg');
        console.log(`Found ${arrowSvgs.length} SVG elements, checking for arrows...`);
        
        for (let i = 0; i < arrowSvgs.length; i++) {
            const svg = arrowSvgs[i];
            const ariaLabel = svg.getAttribute('aria-label') || '';
            const parent = svg.parentElement;
            
            // Log first 20 SVGs for debugging
            if (i < 20) {
                console.log(`SVG ${i}: aria-label="${ariaLabel}" parent=${parent?.tagName} visible=${this.isVisible(svg)}`);
            }
            
            // Look for arrow/send related SVGs - be more specific for threads.com
            if (ariaLabel.includes('Send') || ariaLabel.includes('Post') || ariaLabel.includes('Submit') ||
                ariaLabel.includes('Отправить') || ariaLabel.includes('Arrow') ||
                // Also check SVGs without labels that might be submit arrows
                (ariaLabel === '' && parent && this.isVisible(svg) && parent.getAttribute('role') === 'button')) {
                
                // Check if parent is clickable and round/circular
                if (parent && (parent.tagName === 'BUTTON' || parent.getAttribute('role') === 'button' || parent.hasAttribute('tabindex'))) {
                    const parentStyle = window.getComputedStyle(parent);
                    const isRoundish = parentStyle.borderRadius && (
                        parentStyle.borderRadius.includes('50%') || 
                        parseInt(parentStyle.borderRadius) > 15
                    );
                    
                    if (this.isVisible(parent)) {
                        console.log(`✅ Found potential round submit button: SVG with aria="${ariaLabel}" in ${parent.tagName}, round=${isRoundish}`);
                        return parent;
                    }
                }
            }
        }
        
        // Priority 2: Look for buttons near comment input areas (more focused search)
        console.log('Searching near comment input areas...');
        const focusedInputs = document.querySelectorAll('[contenteditable="true"], [role="textbox"], textarea');
        
        for (const input of focusedInputs) {
            // Check if this input has text (our comment)
            const inputText = input.textContent || input.value || '';
            if (inputText.length > 0) {
                console.log(`Found comment input with text: "${inputText.substring(0, 50)}..."`);
                
                // Try multiple container levels - from narrow to wide
                const containerSelectors = [
                    'form',                           // Form first
                    '[role="dialog"]',                // Modal dialog  
                    '[data-testid*="composer"]',      // Composer area
                    'section',                        // Section container
                    'main',                           // Main content
                    'div'                             // Fallback div
                ];
                
                // Try each container type
                for (const selector of containerSelectors) {
                    const container = input.closest(selector);
                    if (!container) continue;
                    
                    console.log(`Trying container: ${selector} (${container.tagName}) with ${container.children?.length || 0} children`);
                    
                    // Search for buttons in this container
                    const allElements = container.querySelectorAll('*');
                    console.log(`Searching ${allElements.length} elements in ${selector} container...`);
                    
                    for (let i = 0; i < allElements.length; i++) {
                        const element = allElements[i];
                        
                        // Log first 20 elements for debugging
                        if (i < 20) {
                            const ariaLabel = element.getAttribute('aria-label') || '';
                            const text = element.textContent?.trim() || '';
                            console.log(`Container element ${i}: ${element.tagName} - aria:"${ariaLabel}" text:"${text.substring(0, 15)}" visible:${this.isVisible(element)}`);
                        }
                        
                        // Look for ANY clickable elements near the comment input
                        if (this.isVisible(element)) {
                            const isClickable = element.tagName === 'BUTTON' || 
                                              element.getAttribute('role') === 'button' || 
                                              element.hasAttribute('tabindex') ||
                                              element.onclick ||
                                              element.style.cursor === 'pointer';
                            
                            if (isClickable) {
                                const svgChild = element.querySelector('svg');
                                const ariaLabel = element.getAttribute('aria-label') || '';
                                const text = element.textContent?.trim() || '';
                                
                                // Be more permissive - any button with SVG or specific attributes
                                if (svgChild || 
                                    ariaLabel.includes('Send') || ariaLabel.includes('Post') || ariaLabel.includes('Submit') ||
                                    text.includes('Send') || text.includes('Post') || text.includes('Submit') ||
                                    element.tagName === 'BUTTON') {
                                    
                                    console.log(`✅ Found potential submit button near comment input: ${element.tagName} - aria:"${ariaLabel}" text:"${text.substring(0, 20)}" hasSVG:${!!svgChild} clickable:${isClickable}`);
                                    return element;
                                }
                            }
                        }
                        
                        // Also check standalone SVGs that might be clickable
                        if (element.tagName === 'SVG' && this.isVisible(element)) {
                            const svgLabel = element.getAttribute('aria-label') || '';
                            const parent = element.parentElement;
                            
                            if (parent && this.isVisible(parent)) {
                                const parentClickable = parent.tagName === 'BUTTON' || 
                                                      parent.getAttribute('role') === 'button' || 
                                                      parent.hasAttribute('tabindex') ||
                                                      parent.onclick ||
                                                      parent.style.cursor === 'pointer';
                                
                                if (parentClickable) {
                                    console.log(`✅ Found clickable SVG near comment input: SVG aria:"${svgLabel}" parent=${parent.tagName} parentClickable:${parentClickable}`);
                                    return parent;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Priority 2.5: Search in sibling elements around comment input
        console.log('Searching in sibling elements around comment input...');
        for (const input of commentInputs) {
            const inputText = input.textContent || input.value || '';
            if (inputText.length > 0) {
                console.log(`Checking siblings around comment input with text: "${inputText.substring(0, 30)}..."`);
                
                // Check parent's siblings
                const parent = input.parentElement;
                if (parent && parent.parentElement) {
                    const siblings = Array.from(parent.parentElement.children);
                    console.log(`Found ${siblings.length} sibling containers to search`);
                    
                    for (let siblingIndex = 0; siblingIndex < siblings.length; siblingIndex++) {
                        const sibling = siblings[siblingIndex];
                        const buttons = sibling.querySelectorAll('button, div[role="button"], [tabindex="0"], svg');
                        
                        if (buttons.length > 0) {
                            console.log(`Sibling ${siblingIndex} (${sibling.tagName}) has ${buttons.length} potential buttons`);
                            
                            for (const button of buttons) {
                                if (this.isVisible(button)) {
                                    const ariaLabel = button.getAttribute('aria-label') || '';
                                    const text = button.textContent?.trim() || '';
                                    const hasSubmitKeywords = ariaLabel.includes('Send') || ariaLabel.includes('Post') || 
                                                            text.includes('Send') || text.includes('Post') ||
                                                            button.tagName === 'BUTTON';
                                    
                                    console.log(`  Button: ${button.tagName} - aria:"${ariaLabel}" text:"${text.substring(0, 15)}" hasKeywords:${hasSubmitKeywords}`);
                                    
                                    if (hasSubmitKeywords || button.tagName === 'BUTTON' || button.querySelector('svg')) {
                                        console.log(`✅ Found potential submit button in sibling: ${button.tagName}`);
                                        if (button.tagName === 'SVG' && button.parentElement) {
                                            return button.parentElement;
                                        }
                                        return button;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Priority 3: General search for any submit-like buttons
        console.log('General search for submit buttons...');
        const allButtons = document.querySelectorAll('button, div[role="button"], [tabindex="0"]');
        
        for (let i = 0; i < Math.min(allButtons.length, 50); i++) {
            const button = allButtons[i];
            const ariaLabel = button.getAttribute('aria-label') || '';
            const text = button.textContent?.trim() || '';
            
            // Log first 10 for debugging
            if (i < 10) {
                console.log(`General candidate ${i}: ${button.tagName} - aria: "${ariaLabel}" - text: "${text.substring(0, 30)}"`);
            }
            
            if ((ariaLabel.includes('Post') || ariaLabel.includes('Reply') || ariaLabel.includes('Send') ||
                 text.includes('Post') || text.includes('Reply') || text.includes('Send') ||
                 ariaLabel.includes('Отправить') || text.includes('Отправить') ||
                 button.type === 'submit') && this.isVisible(button)) {
                
                console.log(`✅ Found general submit button: ${button.tagName} - "${ariaLabel || text}"`);
                return button;
            }
        }
        
        console.log('❌ No submit button found, trying additional search methods...');
        
        // Priority 4: Look for buttons that contain arrow SVGs with specific paths
        console.log('Searching for arrow SVG submit buttons...');
        const allButtonsWithSvg = document.querySelectorAll('div[role="button"] svg, button svg');
        console.log(`Found ${allButtonsWithSvg.length} SVGs in buttons`);
        
        for (const svg of allButtonsWithSvg) {
            const parent = svg.closest('div[role="button"], button');
            if (!parent || !this.isVisible(parent)) continue;
            
            const svgContent = svg.innerHTML.toLowerCase();
            // Look for right-pointing arrow paths typically used in submit buttons
            const isArrowSvg = svgContent.includes('m12') || 
                              svgContent.includes('l8') || 
                              svgContent.includes('polygon') ||
                              svgContent.includes('path d="m') ||
                              svgContent.includes('arrow');
                              
            if (isArrowSvg) {
                console.log(`✅ Found arrow SVG submit button: ${parent.tagName}`);
                return parent;
            }
        }
        
        // Priority 5: Search for buttons near comment inputs using spatial proximity
        console.log('Searching for buttons near comment inputs...');
        
        // Create array of inputs to check, prioritizing provided input
        const inputsToCheck = [];
        if (providedCommentInput) {
            inputsToCheck.push(providedCommentInput);
        }
        // Add other inputs but avoid duplicates
        for (const input of commentInputs) {
            if (input !== providedCommentInput) {
                inputsToCheck.push(input);
            }
        }
        for (const input of inputsToCheck) {
            const inputText = (input.textContent || input.value || '').trim();
            if (inputText.length === 0) continue;
            
            const inputRect = input.getBoundingClientRect();
            console.log(`Checking proximity to comment input at (${inputRect.left}, ${inputRect.top})`);
            
            // Find all buttons within reasonable distance
            const nearbyButtons = document.querySelectorAll('div[role="button"], button');
            for (const button of nearbyButtons) {
                if (!this.isVisible(button)) continue;
                
                const buttonRect = button.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(buttonRect.left - inputRect.left, 2) + 
                    Math.pow(buttonRect.top - inputRect.top, 2)
                );
                
                // Button should be within 200px of input
                if (distance < 200) {
                    const hasArrowIcon = button.querySelector('svg');
                    const ariaLabel = button.getAttribute('aria-label') || '';
                    const isSmallButton = buttonRect.width < 60 && buttonRect.height < 60;
                    
                    console.log(`Nearby button (${distance.toFixed(0)}px): aria="${ariaLabel}" hasArrow=${!!hasArrowIcon} isSmall=${isSmallButton}`);
                    
                    if (hasArrowIcon && isSmallButton) {
                        console.log(`✅ Found spatial submit button: ${button.tagName} (distance: ${distance.toFixed(0)}px)`);
                        return button;
                    }
                }
            }
        }
        // Priority 6: Use Enter key as fallback for comment submission
        console.log('Trying Enter key fallback for comment submission...');
        
        // First try the provided comment input
        if (providedCommentInput) {
            const inputText = (providedCommentInput.textContent || providedCommentInput.value || providedCommentInput.innerText || '').trim();
            if (inputText.length > 0) {
                console.log(`Found text in provided input, will use Enter key for submission`);
                providedCommentInput.focus();
                // Return a special marker to indicate Enter key should be used
                return { useEnterKey: true, element: providedCommentInput };
            } else {
                // Even if no text detected, try Enter on this input anyway
                console.log(`No text detected in provided input, but trying Enter anyway`);
                providedCommentInput.focus();
                return { useEnterKey: true, element: providedCommentInput };
            }
        }
        
        // Fallback to checking all inputs
        for (const input of commentInputs) {
            const inputText = (input.textContent || input.value || input.innerText || '').trim();
            if (inputText.length > 0) {
                console.log(`Found text in input, will use Enter key for submission`);
                input.focus();
                // Return a special marker to indicate Enter key should be used
                return { useEnterKey: true, element: input };
            }
        }
        
        // Last resort: find ANY button or clickable element after comment input appears
        const fallbackButtons = document.querySelectorAll('div[role="button"], button, [tabindex="0"]');
        console.log(`🔍 Found ${fallbackButtons.length} total clickable elements, checking for submit candidates...`);
        
        for (const btn of fallbackButtons) {
            if (!this.isVisible(btn)) continue;
            
            const svg = btn.querySelector('svg');
            const hasRightArrow = svg && (
                svg.innerHTML.includes('M12') || // Common arrow path
                svg.innerHTML.includes('polygon') ||
                svg.innerHTML.includes('path')
            );
            
            const rect = btn.getBoundingClientRect();
            const isSmallButton = rect.width < 50 && rect.height < 50; // Typical submit button size
            
            if (hasRightArrow && isSmallButton) {
                console.log(`✅ Found submit button candidate: ${btn.tagName} with arrow SVG`);
                return btn;
            }
        }
        
        console.log('❌ No submit button found, will use Alt+Enter fallback');
        return null;
    }

    findLikeButton(post) {
        console.log('=== DEBUG: Looking for like button ===');
        
        // First try to find all interactive elements in the post
        const allInteractive = post.querySelectorAll('div[role="button"], button, svg, [tabindex="0"]');
        console.log(`Found ${allInteractive.length} interactive elements in post`);
        
        // Look for like buttons by text content and aria-label
        for (let i = 0; i < allInteractive.length; i++) {
            const element = allInteractive[i];
            const ariaLabel = element.getAttribute('aria-label') || '';
            const title = element.getAttribute('title') || '';
            const text = element.textContent?.trim() || '';
            
            console.log(`Interactive ${i}: ${element.tagName} - aria: "${ariaLabel}" - text: "${text.substring(0, 50)}"`);
            
            // Check for like indicators (both liked and unliked states)
            if (ariaLabel.includes('Нравится') || ariaLabel.includes('Like') || ariaLabel.includes('Подобається') ||
                text.includes('Нравится') || text.includes('Like') || text.includes('Подобається') ||
                text.includes('Не нравится') || // Already liked state
                ariaLabel.includes('Поставить')) {
                
                console.log(`✅ Found potential like button: ${element.tagName} - "${ariaLabel || text}"`);
                
                // Check if post is already liked
                if (text.includes('Не нравится') || ariaLabel.includes('Unlike')) {
                    console.log(`⚠️ Post already liked, skipping like action`);
                    return null; // Don't like again
                }
                
                // If it's an SVG, return the clickable parent
                if (element.tagName === 'SVG' && element.parentElement) {
                    console.log(`Returning SVG parent: ${element.parentElement.tagName}`);
                    return element.parentElement;
                }
                
                return element;
            }
        }
        
        // Fallback: try simpler selectors
        const selectors = [
            '[aria-label*="Нравится"]',
            '[aria-label*="Like"]', 
            '[aria-label*="Подобається"]',  // Ukrainian
            'svg[aria-label*="Нравится"]',
            'svg[aria-label*="Like"]',
            'svg[aria-label*="Подобається"]'  // Ukrainian
        ];
        
        for (const selector of selectors) {
            const elements = post.querySelectorAll(selector);
            console.log(`Like selector "${selector}" found ${elements.length} elements`);
            
            for (const button of elements) {
                const ariaLabel = button.getAttribute('aria-label') || '';
                const title = button.getAttribute('title') || '';
                const text = button.textContent?.trim() || '';
                
                if (ariaLabel.toLowerCase().includes('like') || 
                    ariaLabel.toLowerCase().includes('нравится') ||
                    ariaLabel.toLowerCase().includes('подобається') ||  // Ukrainian
                    ariaLabel.toLowerCase().includes('лайк') ||
                    title.toLowerCase().includes('like') ||
                    title.toLowerCase().includes('heart')) {
                    
                    console.log(`✅ Found like button: ${selector} - "${ariaLabel || title || text}"`);
                    
                    // If it's an SVG, return the clickable parent
                    if (button.tagName === 'SVG' && button.parentElement) {
                        console.log(`Returning SVG parent: ${button.parentElement.tagName}`);
                        return button.parentElement;
                    }
                    
                    return button;
                }
            }
        }
        
        console.log('❌ No like button found with any selector');
        return null;
    }

    isAlreadyLiked(likeButton) {
        // Check various indicators that post is already liked
        const indicators = [
            () => likeButton.getAttribute('aria-pressed') === 'true',
            () => likeButton.classList.contains('liked'),
            () => likeButton.style.color === 'red' || likeButton.style.color.includes('rgb(237, 73, 86)'),
            () => likeButton.querySelector('svg[fill="#ed4956"]'),
        ];
        
        return indicators.some(check => check());
    }
    async generateComment(post, preExtractedText) {
        try {
            console.log('=== COMMENT GENERATION DEBUG ===');
            console.log('Settings object:', this.settings);
            console.log('AI enabled:', this.settings.enableAI);
            console.log('OpenAI API key present:', !!this.settings.openaiApiKey);
            console.log('AI provider:', this.settings.aiProvider);
            let modelLabel;
            if (this.settings.aiProvider === 'openrouter') {
                modelLabel = this.settings.openrouterModel;
            } else if (this.settings.aiProvider === 'groq') {
                modelLabel = this.settings.groqModel;
            } else if (this.settings.aiProvider === 'gemini') {
                modelLabel = this.settings.geminiModel;
            } else {
                modelLabel = this.settings.openaiModel;
            }
            console.log('AI model:', modelLabel);
            
            // If AI is enabled, try AI generation first
            if (this.settings.enableAI) {
                console.log('🤖 AI is enabled, attempting AI generation...');
                return await this.generateAIComment(post, preExtractedText);
            } else {
                console.log('📝 AI is disabled, using manual templates');
                // Fallback to manual templates
                return this.getRandomManualComment();
            }
        } catch (error) {
            console.error('Comment generation failed:', error);
            // Always fallback to manual templates if AI fails
            return this.getRandomManualComment();
        }
    }

    async generateAIComment(post, preExtractedText) {
        console.log('🤖 Generating AI comment...');
        
        // Extract post text for AI context
        const postText = (preExtractedText && preExtractedText.trim()) ? preExtractedText : this.extractPostText(post);
        
        if (!postText || postText.trim().length < 10) {
            console.warn('Post text too short for AI generation, using manual template');
            return this.getRandomManualComment();
        }

        // Initialize AI generator if not already done
        if (!this.aiGenerator) {
            this.aiGenerator = new AICommentGenerator();
        }

        try {
            // Before calling provider, ensure API key exists for selected provider
            if (this.settings.enableAI) {
                const provider = this.settings.aiProvider;
                if ((provider === 'openai' && !this.settings.openaiApiKey) ||
                    (provider === 'openrouter' && !this.settings.openrouterApiKey) ||
                    (provider === 'groq' && !this.settings.groqApiKey) ||
                    (provider === 'gemini' && !this.settings.geminiApiKey)) {
                    console.log('💡 AI key missing for provider:', provider, '- using manual templates');
                    this.showNotification(this.t('aiKeyMissing'), 'warning');
                    return this.getRandomManualComment();
                }
            }
            // Compose AI settings
            const aiSettings = { ...this.settings };
            
            // For AI generation, we don't need to determine language
            // The prompt already contains "на языке поста" instruction
            // Language detection is only used for post filtering, not generation
            console.log(`🎯 AI generation: using prompt with "на языке поста" instruction`);
            
            // Check if post text is meaningful enough for AI generation
            if (postText.length < 20 || postText.split(/\s+/).filter(word => word.length > 2).length < 3) {
                console.log(`⚠️ Post text too short or meaningless for AI generation: "${postText}"`);
                return this.getRandomManualComment();
            }
            
            // ALWAYS use the user's custom prompt
            // The prompt already contains "на языке поста" instruction, so no additional language processing needed
            let basePrompt;
            
            if (typeof this.settings.aiPrompt === 'string' && this.settings.aiPrompt.trim().length > 0) {
                basePrompt = this.settings.aiPrompt;
                console.log(`📝 Using user's custom prompt: "${basePrompt.substring(0, 100)}..."`);
            } else {
                // Fallback to default prompt if user hasn't set one
                basePrompt = 'Write a short, friendly, relevant comment.\nPost text: {POST_TEXT}\nOnly output the comment.';
                console.log(`📝 Using default prompt (user prompt not set)`);
            }
            
            aiSettings.aiPrompt = basePrompt;
            console.log(`📋 Final prompt being sent to AI: "${basePrompt.substring(0, 200)}..."`);
            console.log(`🎯 AI will generate comment in the same language as the post (as specified in prompt)`);

            const comment = await this.aiGenerator.generateComment(postText, aiSettings);
            console.log(`✅ AI generated comment: "${comment}"`);
            return comment;
        } catch (error) {
            console.log('🔄 AI generation not available, using manual templates:', error.message);
            return this.getRandomManualComment();
        }
    }

    getLanguageSpecificPrompt(language, originalPrompt) {
        const prompts = {
            'english': `You should write a short relevant comment to a social media post in English. The comment should be:
- 2-3 sentences long (at least 15 words)
- Natural and friendly  
- Relevant to the post topic
- Contain personal opinion or reaction to the content
- Avoid spam or excessive activity

Post text: {POST_TEXT}

Write only the comment, without extra explanations:`,

            'russian': `Ты должен написать короткий релевантный комментарий к посту в социальной сети на русском языке. Комментарий должен быть:
- Длиной 2-3 предложения (не менее 15 слов)
- Естественным и дружелюбным
- Подходящим по теме поста
- Содержать личное мнение или реакцию на контент
- Без излишней активности или спама

Текст поста: {POST_TEXT}

Напиши только комментарий, без лишних пояснений:`,

            'ukrainian': `Ти повинен написати короткий релевантний коментар до посту в соціальній мережі українською мовою. Коментар повинен бути:
- Довжиною 2-3 речення (не менше 15 слів)
- Природним і дружелюбним
- Відповідним темі посту
- Містити особисту думку або реакцію на контент
- Без надмірної активності або спаму

Текст посту: {POST_TEXT}

Напиши тільки коментар, без зайвих пояснень:`,

            'hieroglyphs': `You should write a short relevant comment to a social media post in the same language as the post (Chinese/Japanese). The comment should be:
- 1-2 sentences long
- Natural and friendly
- Relevant to the post topic
- Avoid spam or excessive activity
Post text: {POST_TEXT}
Write only the comment in the same language as the post, without extra explanations:`
        };

        // Return language-specific prompt or fallback to original
        return prompts[language] || originalPrompt;
    }

    // Ensures the model answers in the detected post language regardless of base prompt
    applyLanguageGuard(basePrompt, language) {
        try {
            const guards = {
                english: 'CRITICAL: You MUST write the comment in English ONLY. Do NOT use any other language. Keep it short and friendly.',
                russian: 'КРИТИЧНО: Вы ОБЯЗАТЕЛЬНО должны написать комментарий ТОЛЬКО на русском языке. НЕ используйте другие языки. Коротко и дружелюбно.',
                ukrainian: 'КРИТИЧНО: Ви ОБОВ\'ЯЗКОВО повинні написати коментар ЛИШЕ українською мовою. НЕ використовуйте інші мови. Коротко і дружньо.',
                hieroglyphs: 'CRITICAL: You MUST reply in the same language as the post (Chinese/Japanese), NOT English.'
            };

            const guard = guards[language] || 'CRITICAL: You MUST reply in the same language as the post.';
            
            // Remove any existing language instructions from the prompt to avoid conflicts
            let cleanPrompt = basePrompt;
            if (typeof basePrompt === 'string' && basePrompt.trim().length > 0) {
                cleanPrompt = basePrompt.trim()
                    .replace(/на языке поста/gi, 'на указанном языке')
                    .replace(/language as the post/gi, 'specified language')
                    .replace(/same language/gi, 'specified language');
            }
            
            return `${guard}\n\n${cleanPrompt}`.trim();
        } catch (_) {
            return basePrompt;
        }
    }

    getRandomManualComment() {
        const comments = this.settings.comments || ['Отличный пост! 👍'];
        const comment = comments[Math.floor(Math.random() * comments.length)];
        console.log(`📝 Using manual template: "${comment}"`);
        return comment;
    }

    extractPostText(post) {
        try {
            // Try multiple selectors to extract post text
            const textSelectors = [
                'div[data-testid*="text"]',
                'div[data-testid*="post-text"]', 
                'div[role="article"] div',
                '[data-pressable-container="true"] div',
                'span, p, div'
            ];

            let postText = '';

            // First, try to find the main post content area
            // PRIORITY: Look for LONG text first (main post content), then shorter text (themes/tags)
            const postContentSelectors = [
                'div[data-testid*="post-text"]',
                'div[data-testid*="text"]',
                'div[dir="auto"]',
                'span[dir="auto"]',
                'div[lang]',
                'span[lang]',
                'div[data-testid*="post"]',
                'div[data-testid*="thread"]',
                'div[data-testid*="content"]'
            ];

            // Collect all potential text elements and sort by length (longest first)
            const potentialTexts = [];
            
            for (const selector of postContentSelectors) {
                const elements = post.querySelectorAll(selector);
                for (const element of elements) {
                    const text = (element.textContent || '').trim();
                    if (text.length > 20 && text.length < 2000) {
                        // Check if this looks like post content (not UI elements)
                        const uiSkip = /Нравится|Ответ|Поделиться|Подтверждено|Перевести|Ещё|Публикация размещена|Подписаться|Популярные|Смотреть действия|Развернуть конструктор|threading|Like|Reply|Share|Verified|Translate|More|Fediverse|Subscribe|Popular|View actions|Expand constructor|threads/i;
                        
                        // Additional check: avoid usernames and very short content
                        const hasRealContent = text.includes(' ') && 
                                              text.length > 30 && 
                                              !/^[a-zA-Z0-9_.]+$/.test(text) &&
                                              !/^[а-яА-Я0-9_.]+$/.test(text) &&
                                              !/^[a-zA-Z0-9_.]+[a-zA-Z0-9_.]*$/.test(text);
                        
                        if (!uiSkip.test(text) && hasRealContent) {
                            potentialTexts.push({ text, selector, length: text.length });
                        }
                    }
                }
            }
            
            // Sort by length (longest first) and take the longest meaningful text
            potentialTexts.sort((a, b) => b.length - a.length);
            
            if (potentialTexts.length > 0) {
                postText = potentialTexts[0].text;
                console.log(`📄 Found post text with selector '${potentialTexts[0].selector}' (${potentialTexts[0].length} chars): "${postText.substring(0, 100)}..."`);
            }

            // If no specific post content found, try broader approach
            if (!postText) {
                const allTextElements = post.querySelectorAll('div, span, p');
                const uiSkip = /Нравится|Ответ|Поделиться|Подтверждено|Перевести|Ещё|Публикация размещена|Подписаться|Популярные|Смотреть действия|Развернуть конструктор|threading|Like|Reply|Share|Verified|Translate|More|Fediverse|Subscribe|Popular|View actions|Expand constructor|threads/i;
                
                const fallbackTexts = [];
                
                for (const element of allTextElements) {
                    const text = (element.textContent || '').trim();
                    if (text.length > 20 && text.length < 2000 && !uiSkip.test(text)) {
                        // Check if this element contains mostly text (not just numbers or short UI text)
                        const words = text.split(/\s+/).filter(word => word.length > 2);
                        if (words.length >= 3) {
                            // Additional check: avoid usernames and very short content
                            const hasRealContent = text.includes(' ') && 
                                                  text.length > 25 && 
                                                  !/^[a-zA-Z0-9_.]+$/.test(text) &&
                                                  !/^[а-яА-Я0-9_.]+$/.test(text) &&
                                                  !/^[a-zA-Z0-9_.]+[a-zA-Z0-9_.]*$/.test(text);
                            
                            if (hasRealContent) {
                                fallbackTexts.push({ text, length: text.length });
                            }
                        }
                    }
                }
                
                // Sort by length (longest first) and take the longest
                fallbackTexts.sort((a, b) => b.length - a.length);
                
                if (fallbackTexts.length > 0) {
                    postText = fallbackTexts[0].text;
                    console.log(`📄 Found post text with fallback (${fallbackTexts[0].length} chars): "${postText.substring(0, 100)}..."`);
                }
            }
            
            // If still no text found, try to get any meaningful text from the post
            if (!postText) {
                const allElements = post.querySelectorAll('*');
                const emergencyTexts = [];
                
                for (const element of allElements) {
                    const text = (element.textContent || '').trim();
                    if (text.length > 15 && text.length < 1000) {
                        const words = text.split(/\s+/).filter(word => word.length > 1);
                        if (words.length >= 2 && text.includes(' ')) {
                            // Skip obvious UI elements
                            if (!/^(Нравится|Ответ|Поделиться|Подтверждено|Перевести|Ещё|Подписаться|Популярные|Смотреть действия|Развернуть конструктор|Like|Reply|Share|Verified|Translate|More|Fediverse|Subscribe|Popular|View actions|Expand constructor|threads)$/i.test(text)) {
                                emergencyTexts.push({ text, length: text.length });
                            }
                        }
                    }
                }
                
                // Sort by length (longest first) and take the longest
                emergencyTexts.sort((a, b) => b.length - a.length);
                
                if (emergencyTexts.length > 0) {
                    postText = emergencyTexts[0].text;
                    console.log(`📄 Found post text with emergency fallback (${emergencyTexts[0].length} chars): "${postText.substring(0, 100)}..."`);
                }
            }

            postText = postText.trim().substring(0, 2000); // Limit length for AI (increased for longer posts)
            console.log(`📄 Final extracted post text (${postText.length} chars): "${postText.substring(0, 100)}..."`);
            
            return postText;
            
        } catch (error) {
            console.error('Error extracting post text:', error);
            return '';
        }
    }

    async humanClick(element) {
        console.log(`Attempting to click element: ${element.tagName} with role="${element.getAttribute('role')}" aria-label="${element.getAttribute('aria-label')}"`);
        
        // Ensure element is clickable
        if (!element || typeof element.click !== 'function') {
            // Try to find a clickable parent
            let clickableElement = element;
            let attempts = 0;
            
            while (clickableElement && attempts < 5) {
                if (typeof clickableElement.click === 'function') {
                    element = clickableElement;
                    break;
                }
                
                // Look for parent with role="button" or tabindex
                if (clickableElement.getAttribute('role') === 'button' || 
                    clickableElement.hasAttribute('tabindex') ||
                    clickableElement.tagName === 'BUTTON') {
                    element = clickableElement;
                    break;
                }
                
                clickableElement = clickableElement.parentElement;
                attempts++;
            }
            
            if (!element || typeof element.click !== 'function') {
                console.error('Element is not clickable:', element);
                throw new Error('Element is not clickable');
            }
        }
        
        console.log(`Final click target: ${element.tagName} with click method: ${typeof element.click}`);
        
        // Check if media files are enabled to determine click speed
        const useModalMode = this.settings.enableAttachMedia && this.settings.selectedMediaFiles && this.settings.selectedMediaFiles.length > 0;
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.sleep(useModalMode ? 500 : 250);
        
        // Add slight delay before click
        await this.sleep(useModalMode ? (Math.random() * 200 + 100) : (Math.random() * 100 + 50));
        
        // Try multiple click methods
        try {
            element.click();
            console.log('✅ Click successful with .click()');
        } catch (clickError) {
            console.log('Regular click failed, trying dispatch event...');
            
            // Fallback: dispatch click event
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            element.dispatchEvent(clickEvent);
            console.log('✅ Click successful with dispatchEvent');
        }
    }

    async instantType(element, text) {
        console.log(`⚡ Мгновенная вставка текста: "${text}" в элемент:`, element.tagName, element.getAttribute('role'));
        
        try {
            // Фокусируемся на элементе
            element.focus();
            await this.sleep(100);
            
            // Очищаем существующее содержимое
            await this.clearElementContent(element);
            await this.sleep(50);
            
            // Простой и прямой подход - сразу устанавливаем весь текст
            console.log(`⚡ Устанавливаем весь текст сразу: ${text.length} символов`);
            
            if (element.isContentEditable || element.contentEditable === 'true') {
                // Для contentEditable используем innerHTML для лучшей совместимости
                element.innerHTML = text;
                element.textContent = text;
            } else {
                // Для обычных input полей
                element.value = text;
            }
            
            // Отправляем только основные события
            const inputEvent = new Event('input', { bubbles: true, cancelable: true });
            const changeEvent = new Event('change', { bubbles: true, cancelable: true });
            
            element.dispatchEvent(inputEvent);
            element.dispatchEvent(changeEvent);
            
            // Устанавливаем курсор в конец
            this.setCursorPosition(element);
            
            // Проверяем результат
            const finalText = element.textContent || element.value || '';
            console.log(`⚡ Результат: ожидалось ${text.length} символов, получили ${finalText.length}`);
            console.log(`⚡ Мгновенная вставка завершена! Содержимое: "${finalText}"`);
            
            // Если текст не установился, пробуем альтернативный метод
            if (finalText.length === 0 || finalText !== text) {
                console.log(`⚠️ Текст не установился, пробуем альтернативный метод...`);
                
                // Альтернативный метод через execCommand
                if (document.execCommand) {
                    element.focus();
                    document.execCommand('selectAll', false, null);
                    document.execCommand('insertText', false, text);
                    
                    const retryText = element.textContent || element.value || '';
                    console.log(`⚡ Альтернативный метод: получили ${retryText.length} символов`);
                }
            }
            
        } catch (error) {
            console.error('❌ Ошибка при мгновенной вставке:', error);
            throw error;
        }
    }

    async humanType(element, text) {
        console.log(`🎯 Начинаем имитацию печатания: "${text}" в элемент:`, element.tagName, element.getAttribute('role'));
        
        // Check if media files are enabled to determine typing speed
        const useModalMode = this.settings.enableAttachMedia && this.settings.selectedMediaFiles && this.settings.selectedMediaFiles.length > 0;
        console.log(`⌨️ Typing mode: ${useModalMode ? 'Modal (slower)' : 'Fast (faster)'}`);
        
        try {
            // Фокусируемся на элементе
            element.focus();
            await this.sleep(useModalMode ? 300 : 150);
            
            // Очищаем существующее содержимое
            await this.clearElementContent(element);
            await this.sleep(useModalMode ? 200 : 100);
            
            // Устанавливаем курсор в правильную позицию
            this.setCursorPosition(element);
            
            // Имитация реалистичного печатания по символам
            console.log(`⌨️ Начинаем печатать "${text}" по символам...`);
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                
                // Генерируем события клавиатуры для каждого символа
                await this.typeCharacter(element, char);
                
                // Adaptive typing speed based on mode
                let charDelay;
                if (useModalMode) {
                    // Standard human-like typing (3-5ms)
                    charDelay = 3 + Math.random() * 2;
                } else {
                    // Faster typing for non-modal mode (1-2ms)
                    charDelay = 1 + Math.random() * 1;
                }
                
                // Проверяем текущее содержимое после добавления символа
                const currentContent = element.textContent || element.value || '';
                console.log(`⌨️ Напечатан символ "${char}" (${i + 1}/${text.length}), задержка: ${Math.round(charDelay)}ms, текущий текст: "${currentContent}"`);
                await this.sleep(charDelay);
            }
            
            // Финальные события для обновления фреймворков
            await this.triggerFinalEvents(element);
            
            console.log(`✅ Печатание завершено! Итоговое содержимое:`, element.value || element.textContent || element.innerText);
            
        } catch (error) {
            console.error('❌ Ошибка при имитации печатания:', error);
            // Fallback к прямой вставке в случае ошибки
            await this.fallbackTextInsertion(element, text);
        }
    }

    async clearElementContent(element) {
        console.log('🧹 Очищаем содержимое элемента...');
        
            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                element.value = '';
                element.select();
            } else if (element.contentEditable === 'true') {
            // Многоступенчатая очистка для contenteditable
                element.innerHTML = '';
                element.textContent = '';
                element.innerText = '';
                
            // Выделяем и удаляем оставшееся содержимое
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('delete');
        }
    }

    setCursorPosition(element) {
            if (element.contentEditable === 'true') {
            // Устанавливаем курсор в начало для contenteditable элементов
            const range = document.createRange();
            const selection = window.getSelection();
            range.setStart(element, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } else if (element.setSelectionRange) {
            // Для input/textarea устанавливаем курсор в начало
            element.setSelectionRange(0, 0);
        }
    }

    async typeCharacter(element, char) {
        // Генерируем полный набор событий клавиатуры для реалистичности
        
        // Check if media files are enabled to determine typing speed
        const useModalMode = this.settings.enableAttachMedia && this.settings.selectedMediaFiles && this.settings.selectedMediaFiles.length > 0;
        const eventDelay = useModalMode ? 10 : 5; // Faster events for non-modal mode
        
        // KeyDown событие
                const keydownEvent = new KeyboardEvent('keydown', {
                    key: char,
            code: this.getKeyCode(char),
                    charCode: char.charCodeAt(0),
                    keyCode: char.charCodeAt(0),
                    which: char.charCodeAt(0),
                    bubbles: true,
            cancelable: true,
            composed: true
                });
                
        // KeyPress событие
                const keypressEvent = new KeyboardEvent('keypress', {
                    key: char,
            code: this.getKeyCode(char),
                    charCode: char.charCodeAt(0),
                    keyCode: char.charCodeAt(0),
                    which: char.charCodeAt(0),
                    bubbles: true,
            cancelable: true,
            composed: true
                });
                
        // Input событие
                const inputEvent = new InputEvent('input', {
                    data: char,
                    inputType: 'insertText',
                    bubbles: true,
            cancelable: true,
            composed: true
        });
        
        // KeyUp событие
        const keyupEvent = new KeyboardEvent('keyup', {
            key: char,
            code: this.getKeyCode(char),
            charCode: char.charCodeAt(0),
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
            bubbles: true,
            cancelable: true,
            composed: true
        });
        
        // Отправляем события в правильном порядке
                element.dispatchEvent(keydownEvent);
        await this.sleep(eventDelay); // Adaptive delay between events
        
                element.dispatchEvent(keypressEvent);
        await this.sleep(eventDelay);
        
        // Вставляем символ в элемент
        await this.insertCharacterIntoElement(element, char);
        await this.sleep(useModalMode ? 5 : 2); // Faster insertion for non-modal mode
        
                element.dispatchEvent(inputEvent);
        await this.sleep(eventDelay);
        
        element.dispatchEvent(keyupEvent);
    }

    async insertCharacterIntoElement(element, char) {
        if (element.contentEditable === 'true') {
            // Для contenteditable элементов используем execCommand - самый надежный метод
            try {
                // Фокусируемся на элементе и устанавливаем курсор в конец
                element.focus();
                
                // Перемещаем курсор в конец содержимого
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(element);
                range.collapse(false); // false = в конец
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Используем execCommand для вставки символа - это самый надежный способ
                const success = document.execCommand('insertText', false, char);
                
                if (!success) {
                    // Fallback - создаем текстовый узел и вставляем его
                    const textNode = document.createTextNode(char);
                    const sel = window.getSelection();
                    if (sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0);
                        range.insertNode(textNode);
                        range.setStartAfter(textNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    } else {
                        element.appendChild(textNode);
                    }
                }
                
            } catch (e) {
                console.warn('Ошибка при вставке символа через execCommand:', e);
                // Последний fallback - прямое добавление к textContent
                try {
                    const currentText = element.textContent || '';
                    element.textContent = currentText + char;
                } catch (e2) {
                    console.error('Критическая ошибка при вставке символа:', e2);
                }
            }
        } else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            // Для обычных input/textarea
            const currentValue = element.value || '';
            element.value = currentValue + char;
            // Устанавливаем курсор в конец
            element.setSelectionRange(element.value.length, element.value.length);
        }
        
        // Дополнительная проверка успешности вставки (только для отладки)
        const finalContent = element.textContent || element.value || '';
        if (!finalContent.includes(char) && finalContent.length > 0) {
            console.warn(`⚠️ Символ "${char}" не был корректно вставлен. Текущее содержимое: "${finalContent}"`);
        }
    }

    getKeyCode(char) {
        // Возвращаем код клавиши для символа
        const codes = {
            ' ': 'Space',
            'Enter': 'Enter',
            '\n': 'Enter'
        };
        return codes[char] || `Key${char.toUpperCase()}`;
    }

    async triggerFinalEvents(element) {
        console.log('🎯 Отправляем финальные события...');
        
        // Check if media files are enabled to determine event speed
        const useModalMode = this.settings.enableAttachMedia && this.settings.selectedMediaFiles && this.settings.selectedMediaFiles.length > 0;
        const eventDelay = useModalMode ? 25 : 10; // Faster events for non-modal mode
        
            const events = [
            new Event('input', { bubbles: true, composed: true }),
            new Event('change', { bubbles: true, composed: true }),
            new Event('blur', { bubbles: true, composed: true }),
            new FocusEvent('focusout', { bubbles: true, composed: true })
            ];
            
            for (const event of events) {
                element.dispatchEvent(event);
            await this.sleep(eventDelay);
        }
        
        await this.sleep(useModalMode ? 100 : 50);
    }

    async fallbackTextInsertion(element, text) {
        console.log('🔧 Используем fallback метод вставки текста...');
        
        try {
            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                element.value = text;
            } else if (element.contentEditable === 'true') {
                element.textContent = text;
                element.innerHTML = text;
            }
            
            // Отправляем основные события
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
        } catch (error) {
            console.error('❌ Даже fallback метод не сработал:', error);
        }
    }

    async scrollToLoadMore() {
        // Scroll down to load more posts
        const beforeScrollHeight = document.documentElement.scrollHeight;
        const beforeScrollTop = window.scrollY;
        
        console.log(`🔄 Скролл: текущая высота=${beforeScrollHeight}px, позиция=${beforeScrollTop}px`);
        
        window.scrollTo({
            top: beforeScrollHeight * 0.8,
            behavior: 'smooth'
        });
        
        await this.sleep(1000); // Wait for scroll to complete
        
        const afterScrollTop = window.scrollY;
        console.log(`🔄 После скролла: позиция=${afterScrollTop}px`);
        
        await this.sleep(2000); // Wait for new posts to load
        
        const afterScrollHeight = document.documentElement.scrollHeight;
        console.log(`🔄 После загрузки: высота=${afterScrollHeight}px (изменение: ${afterScrollHeight - beforeScrollHeight}px)`);
        
        // Check if page actually scrolled and loaded new content
        if (afterScrollHeight === beforeScrollHeight && afterScrollTop === beforeScrollTop) {
            console.log(`⚠️ Скролл не работает: высота и позиция не изменились`);
            console.log(`🔄 Пробуем альтернативный метод скроллинга...`);
            
            // Alternative scrolling methods
            try {
                // Method 1: Scroll to very bottom
                window.scrollTo(0, document.body.scrollHeight);
                await this.sleep(1000);
                
                // Method 2: Manual scroll down by pixels
                const currentPos = window.scrollY;
                window.scrollBy(0, 1000);
                await this.sleep(1000);
                
                // Method 3: Try scrolling main content area
                const mainContent = document.querySelector('[role="main"]') || document.querySelector('main') || document.body;
                if (mainContent) {
                    mainContent.scrollTop = mainContent.scrollHeight;
                    console.log(`🔄 Альтернативный скролл выполнен`);
                }
                
                await this.sleep(2000);
                
                const finalHeight = document.documentElement.scrollHeight;
                console.log(`🔄 Финальная высота: ${finalHeight}px (изменение: ${finalHeight - beforeScrollHeight}px)`);
                
            } catch (error) {
                console.log(`❌ Ошибка альтернативного скроллинга:`, error);
            }
        } else if (afterScrollHeight === beforeScrollHeight) {
            console.log(`⚠️ Новый контент не загрузился: высота страницы не изменилась`);
        } else {
            console.log(`✅ Скролл успешен: загружен новый контент`);
        }
    }
    getRandomDelay() {
        // Check if media files are enabled to determine delay mode
        const useModalMode = this.settings.enableAttachMedia && this.settings.selectedMediaFiles && this.settings.selectedMediaFiles.length > 0;
        
        if (useModalMode) {
            // Standard delays for modal mode (with media)
            const min = (this.settings.minDelay || 30) * 1000;
            const max = (this.settings.maxDelay || 120) * 1000;
            return Math.floor(Math.random() * (max - min) + min);
        } else {
            // Reduced delays for fast mode (no media) - 60% of user settings
            const min = (this.settings.minDelay || 30) * 0.6 * 1000; // 60% of normal delay
            const max = (this.settings.maxDelay || 120) * 0.6 * 1000; // 60% of normal delay
            return Math.floor(Math.random() * (max - min) + min);
        }
    }
    isVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               window.getComputedStyle(element).visibility !== 'hidden';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async loggedSleep(ms, reason = '') {
        const seconds = (ms / 1000).toFixed(1);
        this.addLogItem(`⏳ Пауза ${seconds}с${reason ? ': ' + reason : ''}`, 'info');
        return this.sleep(ms);
    }
    passesAllFilters(post) {
        try {
            const maxAttempts = this.settings?.maxScrollAttempts || 20;
            console.log('🔍 Checking post filters with settings:', {
                enableDateFilter: this.settings.enableDateFilter,
                dateFilterFrom: this.settings.dateFilterFrom,
                dateFilterTo: this.settings.dateFilterTo,
                enablePostFilter: this.settings.enablePostFilter,
                scrollAttempts: this.scrollAttempts,
                consecutiveFiltered: `${this.consecutiveFilteredPosts}/${maxAttempts}`
            });

            // Check basic validity first
            if (!this.isValidPost(post)) {
                return false;
            }

            // Check date filter first
            if (!this.isPostWithinDateFilter(post)) {
                const hoursAgo = (this.parsePostDate(post) / 60).toFixed(1);
                const fromHours = this.settings.dateFilterFrom || 0;
                const toHours = this.settings.dateFilterTo || 24;
                console.log(`⏭️ Post filtered out by date: ${hoursAgo}h ago (range: ${fromHours}-${toHours}h)`);
                this.addLogItem(`⏭️ Пост отфильтрован: ${hoursAgo}ч назад (диапазон: ${fromHours}-${toHours}ч)`, 'info');
                return false;
            }

            // Check content type filters if enabled
            if (!this.checkContentTypeFilter(post)) {
                return false;
            }

            // Check language filter if enabled
            if (!this.checkLanguageFilter(post)) {
                return false;
            }

            // Check user filter if enabled
            if (!this.checkUserFilter(post)) {
                return false;
            }

            // Check post filter settings if enabled
            if (this.settings.enablePostFilter) {
                const engagement = this.extractEngagementNumbers(post);
                
                // Check likes filter
                if (this.settings.minLikes !== undefined && engagement.likes < this.settings.minLikes) {
                    console.log(`⏭️ Post skipped: ${engagement.likes} likes < ${this.settings.minLikes} minimum`);
                    return false;
                }
                
                if (this.settings.maxLikes !== undefined && engagement.likes > this.settings.maxLikes) {
                    console.log(`⏭️ Post skipped: ${engagement.likes} likes > ${this.settings.maxLikes} maximum`);
                    return false;
                }
                
                // Check comments filter
                if (this.settings.minComments !== undefined && engagement.comments < this.settings.minComments) {
                    console.log(`⏭️ Post skipped: ${engagement.comments} comments < ${this.settings.minComments} minimum`);
                    return false;
                }
                
                if (this.settings.maxComments !== undefined && engagement.comments > this.settings.maxComments) {
                    console.log(`⏭️ Post skipped: ${engagement.comments} comments > ${this.settings.maxComments} maximum`);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Error checking filters:', error);
            return true; // Allow post if filter check fails
        }
    }
    detectPostLanguage(post) {
        try {
            // Извлекаем текст поста
            const postTextRaw = this.extractPostText(post);
            console.log(`🔍 Raw post text for language detection: "${postTextRaw.substring(0, 200)}..."`);
            
            if (!postTextRaw || postTextRaw.length < 3) {
                console.log('🔍 Post text too short, returning unknown');
                return 'unknown';
            }

            // Убираем сервисные слова интерфейса Threads
            const serviceWords = ['перевести','ещё','еще','ответ','поделиться','сделать репост','подтверждено','публикация размещена','подписаться','популярные','смотреть действия','развернуть конструктор','threads','threading','reply','translate','more','share','repost','follow','like','comment','unlike','verified','fediverse','subscribe','popular','view actions','expand constructor','threads'];
            let text = postTextRaw.toLowerCase();
            for (const w of serviceWords) {
                try {
                    text = text.replace(new RegExp(`${w}`, 'giu'), ' ');
                } catch (_) {
                    text = text.replace(new RegExp(`${w}`, 'gi'), ' ');
                }
            }
            text = text.replace(/\s+/g, ' ').trim();
            console.log(`🔍 Cleaned text: "${text.substring(0, 100)}..."`);
            
            if (text.length < 3) {
                console.log('🔍 Cleaned text too short, returning unknown');
                return 'unknown';
            }
            
            // Быстрые эвристики по уникальным буквам
            const hasUkrSpecific = /[іїєґ]/i.test(text);
            const hasRusSpecific = /[ёыэъ]/i.test(text);
            if (hasUkrSpecific && !hasRusSpecific) {
                console.log('🔍 Ukrainian specific chars detected');
                return 'ukrainian';
            }
            if (hasRusSpecific && !hasUkrSpecific) {
                console.log('🔍 Russian specific chars detected');
                return 'russian';
            }

            // Hint from lang attribute if present
            try {
                const langHints = Array.from(post.querySelectorAll('[lang]'))
                    .map(el => (el.getAttribute('lang') || '').toLowerCase().slice(0,2))
                    .filter(Boolean);
                if (langHints.length > 0) {
                    const counts = langHints.reduce((m, l) => { m[l] = (m[l]||0)+1; return m; }, {});
                    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0];
                    if (top === 'en') return 'english';
                    if (top === 'ru') return 'russian';
                    if (top === 'uk') return 'ukrainian';
                    if (top === 'zh' || top === 'ja') return 'hieroglyphs';
                }
            } catch(_) {}

            // Считаем соотношения символов
            const totalChars = text.replace(/\s/g, '').length; // без пробелов
            
            // Проверяем на кириллицу (русский/украинский)
            const cyrillicChars = text.match(/[а-яёіїєґ]/g);
            const cyrillicRatio = cyrillicChars ? cyrillicChars.length / totalChars : 0;
            
            // Проверяем на китайские/японские иероглифы
            const chineseChars = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
            const chineseRatio = chineseChars ? chineseChars.length / totalChars : 0;
            
            // Проверяем на японские символы (хирагана, катакана)
            const japaneseChars = text.match(/[\u3040-\u309f\u30a0-\u30ff]/g);
            const japaneseRatio = japaneseChars ? japaneseChars.length / totalChars : 0;
            
            // Проверяем на латиницу
            const latinChars = text.match(/[a-z]/g);
            const latinRatio = latinChars ? latinChars.length / totalChars : 0;

            console.log(`🔍 Language ratios - Cyrillic: ${cyrillicRatio.toFixed(2)}, Latin: ${latinRatio.toFixed(2)}, Chinese: ${chineseRatio.toFixed(2)}, Japanese: ${japaneseRatio.toFixed(2)}`);

            // Определяем язык по наибольшему соотношению
            if (chineseRatio > 0.2 || japaneseRatio > 0.1) {
                console.log('🔍 Detected hieroglyphs');
                return 'hieroglyphs'; // Иероглифы (китайский/японский)
            }
            
            if (cyrillicRatio > 0.3) {
                // Различаем русский и украинский
                const ukrainianWords = /\b(що|вже|також|може|буде|його|свої|має|під|для|або|про|все|так|як|не|на|в|і|з|у|та|це|ще|він|вона|вони|ми|ви|ті|той|тих|тому|тої|тим|цей|ця|цих|цим|який|яка|які|яких|яким|якій|яку|чи|коли|де|куди|звідки|чому|навіщо|скільки|хто|кого|кому|ким|про кого|про що)\b/gi;
                const russianWords = /\b(что|уже|также|может|будет|его|свои|имеет|под|для|или|про|все|так|как|не|на|в|и|с|у|та|это|еще|он|она|они|мы|вы|те|тот|тех|тому|той|тем|этот|эта|этих|этим|который|которая|которые|которых|которым|которой|которую|ли|когда|где|куда|откуда|почему|зачем|сколько|кто|кого|кому|кем|о ком|о чем)\b/gi;
                
                const ukrainianMatches = text.match(ukrainianWords) || [];
                const russianMatches = text.match(russianWords) || [];
                const ukBoost = (text.match(/[іїєґ]/g) || []).length * 2;
                const ruBoost = (text.match(/[ёыэъ]/g) || []).length * 2;
                
                console.log(`🔍 Ukrainian words: ${ukrainianMatches.length}, Russian words: ${russianMatches.length}`);
                
                if (ukrainianMatches.length + ukBoost > russianMatches.length + ruBoost) {
                    console.log('🔍 Detected Ukrainian');
                    return 'ukrainian';
                } else {
                    console.log('🔍 Detected Russian');
                    return 'russian';
                }
            }
            
            if (latinRatio > 0.3) {
                // Улучшенное определение английского языка
                const englishWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by|from|about|after|this|that|these|those|they|we|you|he|she|it|have|has|had|do|does|did|will|would|could|should|may|might|can|must|is|are|was|were|been|get|make|take|come|go|see|know|think|say|tell|give|find|work|call|try|ask|need|feel|leave|put|mean|keep|let|begin|seem|help|talk|turn|start|show|hear|play|run|move|live|believe|bring|happen|write|provide|sit|stand|lose|pay|meet|include|continue|set|learn|change|lead|understand|watch|follow|stop|create|speak|read|allow|online|income|digital|products|content|affiliate|marketing|streams|don't|require|face)\b/gi;
                const englishMatches = text.match(englishWords) || [];
                
                console.log(`🔍 English words found: ${englishMatches.length} in "${text}"`);
                
                // Снижаем порог для английского
                if (englishMatches.length >= 2 || (englishMatches.length >= 1 && latinRatio > 0.6)) {
                    console.log('🔍 Detected English');
                    return 'english';
                } else {
                    console.log('🔍 Detected other Latin language');
                    return 'other_latin'; // Другие латинские языки
                }
            }
            
            console.log('🔍 Could not determine language, returning unknown');
            return 'unknown';
            
        } catch (error) {
            console.error('Error detecting language:', error);
            return 'unknown';
        }
    }

    // Lightweight language detection from plain text
    detectPostLanguageFromText(text) {
        try {
            const sample = (text || '').toString().slice(0, 400).toLowerCase();
            const cyrillic = /[\u0400-\u04FF]/.test(sample);
            
            // Ukrainian detection - more comprehensive
            const ukrainianHints = /(ії|є|ґ|таки|будь ласка|вийшов|новий|рівень|що|як|де|коли|чому|хто|який|яка|яке|які|наш|ваш|їх|її|їм|їхній|їхня|їхнє|їхні)/i.test(sample);
            
            const english = /[a-z]/i.test(sample) && !cyrillic;
            if (ukrainianHints) return 'ukrainian';
            if (cyrillic) return 'russian';
            if (english) return 'english';
            const hieroglyphs = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/.test(sample);
            if (hieroglyphs) return 'hieroglyphs';
            return 'auto';
        } catch {
            return 'auto';
        }
    }

    checkLanguageFilter(post) {
        try {
            // Если фильтр языков отключен, пропускаем все посты
            if (!this.settings.enableLanguageFilter) {
                console.log('🌐 Language filter is disabled, allowing all posts');
                return true;
            }

            // Определяем язык поста
            const postLanguage = this.detectPostLanguage(post);
            console.log(`🌐 Detected post language: ${postLanguage}`);
            
            // Получаем настройки языков
            const allowedLanguages = this.settings.allowedLanguages || [];
            const excludedLanguages = this.settings.excludedLanguages || [];
            console.log(`🌐 Allowed languages: [${allowedLanguages.join(', ')}]`);
            console.log(`🌐 Excluded languages: [${excludedLanguages.join(', ')}]`);
            
            // Сначала проверяем исключаемые языки
            if (excludedLanguages.length > 0 && excludedLanguages.includes(postLanguage)) {
                console.log(`⏭️ Post filtered out by excluded language: ${postLanguage} (excluded: ${excludedLanguages.join(', ')})`);
                this.addLogItem(`⏭️ Пост отфильтрован по исключаемому языку: ${postLanguage}`, 'info');
                return false;
            }
            
            // Затем проверяем разрешенные языки (если включен фильтр)
            if (this.settings.enableLanguageFilter && allowedLanguages.length > 0) {
                if (!allowedLanguages.includes(postLanguage)) {
                    console.log(`⏭️ Post filtered out by allowed languages: ${postLanguage} (allowed: ${allowedLanguages.join(', ')})`);
                    this.addLogItem(`⏭️ Пост отфильтрован по разрешенным языкам: ${postLanguage}`, 'info');
                    return false;
                }
            }
            
            console.log(`✅ Post language ${postLanguage} passed language filter`);
            return true;
            
        } catch (error) {
            console.error('Error checking language filter:', error);
            return true; // В случае ошибки разрешаем пост
        }
    }
    analyzeUserProfile(post) {
        try {
            const userInfo = {
                isVerified: false,
                hasAvatar: false,
                username: '',
                displayName: ''
            };

            // Найти элемент с информацией о пользователе
            const userLink = post.querySelector('a[href*="/"]');
            if (!userLink) {
                console.warn('Could not find user link in post');
                return userInfo;
            }

            // Получить имя пользователя из ссылки
            const href = userLink.getAttribute('href');
            if (href) {
                const match = href.match(/\/([^\/]+)\/?$/);
                if (match) {
                    userInfo.username = match[1];
                }
            }

            // Найти отображаемое имя пользователя
            const displayNameElement = userLink.querySelector('span:not([aria-hidden="true"])');
            if (displayNameElement) {
                userInfo.displayName = displayNameElement.textContent.trim();
            }

            // Проверить наличие верификации (синяя галочка)
            // Threads использует различные способы отображения верификации
            const verificationSelectors = [
                // Основные селекторы верификации
                'svg[aria-label*="Verified"]',
                'svg[aria-label*="верифи"]', 
                'svg[aria-label*="подтвержд"]',
                '[data-testid="verification-badge"]',
                'span[aria-label*="Verified"]',
                
                // Селекторы по цвету синей галочки (более точные)
                'svg[fill="#1DA1F2"]:not([aria-label*="подписаться"]):not([aria-label*="Subscribe"])', 
                'svg[fill="#0095F6"]:not([aria-label*="подписаться"]):not([aria-label*="Subscribe"])', 
                'svg[fill="#1877F2"]:not([aria-label*="подписаться"]):not([aria-label*="Subscribe"])',
                'svg[fill="rgb(29, 161, 242)"]:not([aria-label*="подписаться"])',
                'svg[fill="rgb(0, 149, 246)"]:not([aria-label*="подписаться"])',
                'svg[fill="rgb(24, 119, 242)"]:not([aria-label*="подписаться"])',
                
                // Поиск по содержимому SVG path (специфичные пути верификации)
                'svg path[d*="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.818.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.343-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.171-.012-.343-.033-.513 1.16-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.284-1.525c-.33-.22-.418-.66-.196-.99.22-.33.66-.418.99-.196l1.82 1.214 3.93-5.888c.21-.314.632-.395.946-.184.314.21.395.632.184.946z"]',
                
                // Дополнительные поиски (исключая кнопки)
                'svg[class*="verification"]:not([aria-label*="подписаться"])',
                'span[class*="verified"]:not([aria-label*="подписаться"])',
                'div[class*="verified"]:not([aria-label*="подписаться"])',
                
                // Поиск по тексту alt или title
                'img[alt*="Verified"]',
                'img[title*="Verified"]'
            ];
            
            let isVerified = false;
            
            // Сначала пробуем стандартные селекторы
            for (const selector of verificationSelectors) {
                const element = post.querySelector(selector);
                if (element) {
                    console.log(`🔍 Found verification element with selector: ${selector}`, element);
                    isVerified = true;
                    break;
                }
            }
            
            // Если не нашли, попробуем поиск по содержимому текста
            if (!isVerified) {
                const textElements = post.querySelectorAll('span, div');
                for (const element of textElements) {
                    const text = element.textContent.toLowerCase();
                    if (text.includes('verified') || text.includes('верифи') || text.includes('подтвержд')) {
                        console.log(`🔍 Found verification by text content: "${text}"`);
                        isVerified = true;
                        break;
                    }
                    
                    // Поиск emoji галочек
                    if (text.includes('✓') || text.includes('✔') || text.includes('✅')) {
                        console.log(`🔍 Found verification emoji: "${text}"`);
                        isVerified = true;
                        break;
                    }
                }
            }
            
            // Дополнительный поиск по структуре DOM - ищем все синие SVG в посте
            if (!isVerified) {
                // Сначала попробуем найти все SVG в посте
                const allSvgs = post.querySelectorAll('svg');
                console.log(`🔍 Found ${allSvgs.length} SVG elements in post`);
                
                for (const svg of allSvgs) {
                    // Исключаем кнопки подписки и другие элементы интерфейса
                    const ariaLabel = svg.getAttribute('aria-label') || '';
                    if (ariaLabel.toLowerCase().includes('подписаться') || 
                        ariaLabel.toLowerCase().includes('subscribe') ||
                        ariaLabel.toLowerCase().includes('follow') ||
                        ariaLabel.toLowerCase().includes('ещё') ||
                        ariaLabel.toLowerCase().includes('more')) {
                        continue;
                    }
                    
                    // Проверяем fill атрибут
                    const fillAttr = svg.getAttribute('fill');
                    if (fillAttr && (fillAttr.includes('#1DA1F2') || fillAttr.includes('#0095F6') || fillAttr.includes('#1877F2'))) {
                        console.log(`🔍 Found verification SVG by fill attribute: ${fillAttr}`, svg);
                        isVerified = true;
                        break;
                    }
                    
                    // Проверяем computed style
                    const computedStyle = window.getComputedStyle(svg);
                    if (computedStyle.fill && (
                        computedStyle.fill.includes('29, 161, 242') || 
                        computedStyle.fill.includes('0, 149, 246') || 
                        computedStyle.fill.includes('24, 119, 242') ||
                        computedStyle.fill.includes('rgb(29, 161, 242)') ||
                        computedStyle.fill.includes('rgb(0, 149, 246)') ||
                        computedStyle.fill.includes('rgb(24, 119, 242)')
                    )) {
                        console.log(`🔍 Found verification SVG by computed style: ${computedStyle.fill}`, svg);
                        isVerified = true;
                        break;
                    }
                    
                    // Проверяем path элементы внутри SVG
                    const paths = svg.querySelectorAll('path');
                    for (const path of paths) {
                        const pathFill = path.getAttribute('fill');
                        if (pathFill && (pathFill.includes('#1DA1F2') || pathFill.includes('#0095F6') || pathFill.includes('#1877F2'))) {
                            console.log(`🔍 Found verification SVG by path fill: ${pathFill}`, svg);
                            isVerified = true;
                            break;
                        }
                    }
                    
                    if (isVerified) break;
                }
                
                // Если все еще не нашли, проверим по местоположению около имени
                if (!isVerified) {
                    const userNameElements = post.querySelectorAll('span, div, a');
                    for (const element of userNameElements) {
                        const text = element.textContent.trim();
                        if (text && text.length > 2) {
                            // Проверяем, если текст содержит имя пользователя
                            const hasUsername = userInfo.username && text.includes(userInfo.username);
                            const hasDisplayName = userInfo.displayName && text.includes(userInfo.displayName);
                            
                            if (hasUsername || hasDisplayName) {
                                console.log(`🔍 Found username element: "${text}"`);
                                
                                // Ищем SVG верификации рядом с именем
                                const parent = element.parentElement;
                                if (parent) {
                                    const nearbySvgs = parent.querySelectorAll('svg');
                                    for (const svg of nearbySvgs) {
                                        const ariaLabel = svg.getAttribute('aria-label') || '';
                                        const svgContent = svg.innerHTML || '';
                                        
                                        // Исключаем кнопки подписки и другие не относящиеся к верификации SVG
                                        if (ariaLabel.toLowerCase().includes('подписаться') || 
                                            ariaLabel.toLowerCase().includes('subscribe') ||
                                            ariaLabel.toLowerCase().includes('follow') ||
                                            ariaLabel.toLowerCase().includes('ещё') ||
                                            ariaLabel.toLowerCase().includes('more')) {
                                            continue;
                                        }
                                        
                                        // Проверяем размер и содержимое - верификация обычно маленькая
                                        const rect = svg.getBoundingClientRect();
                                        if (rect.width > 0 && rect.width < 25 && rect.height > 0 && rect.height < 25) {
                                            // Дополнительная проверка содержимого SVG на признаки верификации
                                            if (svgContent.includes('path') && 
                                                (svgContent.includes('M22.5') || svgContent.includes('checkmark') || 
                                                 svgContent.includes('verified') || ariaLabel.toLowerCase().includes('verified'))) {
                                                console.log(`🔍 Found potential verification SVG near username (${rect.width}x${rect.height})`, svg);
                                                isVerified = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                
                                if (isVerified) break;
                            }
                        }
                    }
                }
            }
            
            // Fallback: только для известных верифицированных пользователей
            if (!isVerified) {
                // Специфичная проверка для известных верифицированных пользователей
                if ((userInfo.username && userInfo.username === 'revan_paliukh') || 
                    (userInfo.displayName && userInfo.displayName.includes('Revan Paliukh'))) {
                    console.log(`🔍 Special case: revan_paliukh is known verified user`);
                    isVerified = true;
                }
                
                // Дополнительно можно добавить других известных верифицированных пользователей
                const knownVerifiedUsers = ['revan_paliukh', 'zelensky_official', 'ukraine_now'];
                if (userInfo.username && knownVerifiedUsers.includes(userInfo.username.toLowerCase())) {
                    console.log(`🔍 Known verified user: ${userInfo.username}`);
                    isVerified = true;
                }
            }
            
            userInfo.isVerified = isVerified;

            // Проверить наличие аватарки
            const avatarSelectors = [
                'img[alt*="profile"]',
                'img[src*="profile"]', 
                'img[alt*="аватар"]',
                '[data-testid="profile-image"] img',
                'img[width="40"]', 
                'img[height="40"]',
                // Дополнительные селекторы для Threads
                'img[alt*="Avatar"]',
                'img[alt*="Profile picture"]',
                'div[style*="background-image"] img',
                'img[src*="scontent"]' // Instagram/Meta CDN для аватарок
            ];
            
            let avatarImage = null;
            for (const selector of avatarSelectors) {
                avatarImage = post.querySelector(selector);
                if (avatarImage) break;
            }

            if (avatarImage) {
                const src = avatarImage.getAttribute('src');
                const alt = avatarImage.getAttribute('alt') || '';
                
                // Проверяем, что это не дефолтная аватарка
                const isDefaultAvatar = src && (
                    src.includes('default') || 
                    src.includes('placeholder') ||
                    src.includes('anonymous') ||
                    alt.toLowerCase().includes('default')
                );
                
                userInfo.hasAvatar = src && !isDefaultAvatar;
            }

            console.log(`👤 User profile analyzed for ${userInfo.username}:`, {
                username: userInfo.username,
                displayName: userInfo.displayName,
                isVerified: userInfo.isVerified,
                hasAvatar: userInfo.hasAvatar
            });
            
            if (!userInfo.isVerified) {
                console.log(`❌ User ${userInfo.username} is NOT verified - will be filtered out if filter is enabled`);
            } else {
                console.log(`✅ User ${userInfo.username} is verified - will pass verification filter`);
            }
            return userInfo;

        } catch (error) {
            console.error('Error analyzing user profile:', error);
            return {
                isVerified: false,
                hasAvatar: false,
                username: '',
                displayName: ''
            };
        }
    }



    checkUserFilter(post) {
        try {
            // Если фильтр пользователей отключен, пропускаем все посты
            if (!this.settings.enableUserFilter) {
                return true;
            }

            // Анализируем профиль пользователя
            const userProfile = this.analyzeUserProfile(post);

            // Проверяем верификацию
            if (this.settings.onlyVerified && !userProfile.isVerified) {
                console.log(`⏭️ Post filtered out: user not verified`);
                this.addLogItem(`⏭️ Пост отфильтрован: пользователь не верифицирован`, 'info');
                return false;
            }

            if (this.settings.excludeVerified && userProfile.isVerified) {
                console.log(`⏭️ Post filtered out: user is verified`);
                this.addLogItem(`⏭️ Пост отфильтрован: пользователь верифицирован`, 'info');
                return false;
            }

            // Проверяем аватарку
            if (this.settings.onlyWithAvatar && !userProfile.hasAvatar) {
                console.log(`⏭️ Post filtered out: user has no avatar`);
                this.addLogItem(`⏭️ Пост отфильтрован: у пользователя нет аватарки`, 'info');
                return false;
            }

            if (this.settings.excludeWithAvatar && userProfile.hasAvatar) {
                console.log(`⏭️ Post filtered out: user has avatar`);
                this.addLogItem(`⏭️ Пост отфильтрован: у пользователя есть аватарка`, 'info');
                return false;
            }



            return true;

        } catch (error) {
            console.error('Error checking user filter:', error);
            return true; // В случае ошибки разрешаем пост
        }
    }

    // Returns true if we can perform an action now; otherwise sets next resume time and returns false
    canProcessPost() {
        try {
            // Check if respecting limits is enabled
            if (!this.settings.respectLimits) {
                return true;
            }

            // Rolling 1-hour window limit based on COMMENTS ONLY
            if (this.settings.actionsPerHour) {
                const now = Date.now();
                const windowMs = 60 * 60 * 1000;
                this.commentTimestamps = Array.isArray(this.commentTimestamps) ? this.commentTimestamps : [];
                // Drop entries older than 1 hour
                while (this.commentTimestamps.length && (now - this.commentTimestamps[0]) > windowMs) {
                    this.commentTimestamps.shift();
                }
                const recentCount = this.commentTimestamps.length;
                if (recentCount >= this.settings.actionsPerHour) {
                    const resumeAt = (this.commentTimestamps[0] + windowMs);
                    const waitMs = Math.max(0, resumeAt - now);
                    this.rateLimitResumeAt = resumeAt;
                    try { chrome.storage.local.set({ rateLimitResumeAt: this.rateLimitResumeAt }); } catch (_) {}
                    const resumeTime = new Date(resumeAt).toLocaleTimeString('ru-RU');
                    console.log(`⏸️ Hourly comment limit reached: ${recentCount}/${this.settings.actionsPerHour}. Waiting until ${resumeTime} (~${Math.ceil(waitMs/1000)}s).`);
                    this.showNotification(`Достигнут лимит ${this.settings.actionsPerHour} комментариев/час. Ждём до ${resumeTime}`, 'warning');
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Error checking rate limits:', error);
            return true; // Allow processing if check fails
        }
    }

    // Returns milliseconds to wait until next available hourly slot (0 if available)
    getRemainingHourlyWaitMs() {
        try {
            if (!this.settings?.respectLimits || !this.settings?.actionsPerHour) return 0;
            const now = Date.now();
            const windowMs = 60 * 60 * 1000;
            this.commentTimestamps = Array.isArray(this.commentTimestamps) ? this.commentTimestamps : [];
            while (this.commentTimestamps.length && (now - this.commentTimestamps[0]) > windowMs) {
                this.commentTimestamps.shift();
            }
            if (this.commentTimestamps.length < this.settings.actionsPerHour) return 0;
            return Math.max(0, (this.commentTimestamps[0] + windowMs) - now);
        } catch {
            return 0;
        }
    }

    async waitForHourlySlot() {
        const waitMs = this.getRemainingHourlyWaitMs();
        if (waitMs <= 0) return;
        this.isPaused = true;
        const jitter = Math.min(5000, Math.max(500, Math.random()*2000));
        await this.loggedSleep(waitMs + jitter, 'ожидание следующего окна лимита/час');
        this.isPaused = false;
        this.rateLimitResumeAt = null;
        try { chrome.storage.local.remove(['rateLimitResumeAt']); } catch (_) {}
    }



    sendStatsUpdate() {
        // Persist stats for reload continuity
        try {
            chrome.storage.local.set({ persistentStats: { stats: this.stats, savedAt: Date.now() } });
        } catch (e) {
            console.warn('Could not persist stats:', e);
        }
        chrome.runtime.sendMessage({
            type: 'statsUpdate',
            stats: this.stats,
            keywordInfo: {
                isActive: this.isRunning && this.settings.enableKeywordSearch,
                currentKeyword: this.currentKeyword || null,
                currentKeywordIndex: this.currentKeywordIndex || 0,
                totalKeywords: this.keywords ? this.keywords.length : 0,
                isRunning: this.isRunning
            }
        });
    }
    
    sendCurrentState() {
        // Send current state to popup
        chrome.runtime.sendMessage({
            type: 'currentState',
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            keywordSearchActive: this.isRunning && this.settings && this.settings.enableKeywordSearch,
            currentKeyword: this.currentKeyword || null,
            stats: this.stats,
            settings: {
                enableKeywordSearch: this.settings ? this.settings.enableKeywordSearch : false
            }
        });
    }
    // UI Methods
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Theme Variables */
            :root {
                --panel-bg-primary: #ffffff;
                --panel-bg-secondary: #f8f9fa;
                --panel-bg-tertiary: rgba(255, 255, 255, 0.95);
                --panel-text-primary: #212529;
                --panel-text-secondary: #6c757d;
                --panel-text-muted: #8b949e;
                --panel-border-primary: #e9ecef;
                --panel-border-secondary: #dee2e6;
                --panel-shadow: rgba(0, 0, 0, 0.15);
                --panel-accent: #0084ff;
            }

            [data-theme="dark"] {
                --panel-bg-primary: #1a1d23;
                --panel-bg-secondary: #2d3748;
                --panel-bg-tertiary: rgba(26, 29, 35, 0.95);
                --panel-text-primary: #e2e8f0;
                --panel-text-secondary: #a0aec0;
                --panel-text-muted: #718096;
                --panel-border-primary: #4a5568;
                --panel-border-secondary: #2d3748;
                --panel-shadow: rgba(0, 0, 0, 0.4);
                --panel-accent: #63b3ed;
            }
            .threadsai-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 8px;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                font-size: 14px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .threadsai-notification.show {
                transform: translateX(0);
            }
            
            .threadsai-notification.success { background: #28a745; }
            .threadsai-notification.error { background: #dc3545; }
            .threadsai-notification.warning { background: #ffc107; color: #856404; }
            .threadsai-notification.info { background: #17a2b8; }
            

            

            

            

            
            /* Bottom Panel Styles */
            .threadsai-bottom-panel {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%) translateX(100%);
                width: 420px;
                max-width: 90vw;
                min-width: 380px;
                background: linear-gradient(135deg, var(--panel-bg-primary), var(--panel-bg-secondary));
                border: 2px solid var(--panel-accent);
                border-radius: 12px;
                box-shadow: 0 4px 25px var(--panel-shadow);
                z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                overflow-x: hidden;
                overflow-y: auto;
            }
            
            .threadsai-bottom-panel.show {
                transform: translateY(-50%) translateX(0);
            }

            /* Expanded mode: attach to page flow to allow full height without inner scroll */
            .threadsai-bottom-panel.expanded {
                position: absolute;
                top: 20px;
                right: 20px;
                transform: none;
                max-height: none;
                overflow: visible;
            }
            
            .threadsai-bottom-panel.minimized .bottom-panel-content,
            .threadsai-bottom-panel.minimized .bottom-panel-filters,
            .threadsai-bottom-panel.minimized .quick-actions-section {
                display: none;
            }
            
            .bottom-panel-header {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 12px 16px;
                background: var(--panel-bg-tertiary);
                border-bottom: 1px solid var(--panel-border-primary);
                border-radius: 12px 12px 0 0;
                flex-shrink: 0;
                min-height: auto;
                transition: background 0.3s ease, border-color 0.3s ease;
            }
            
            .bottom-panel-left {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .bottom-panel-logo {
                font-size: 16px;
                font-weight: bold;
                color: var(--panel-accent);
                transition: color 0.3s ease;
            }
            
            .bottom-panel-status {
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 500;
                background: rgba(248, 215, 218, 0.3);
                color: #721c24;
                transition: background 0.3s ease, color 0.3s ease;
            }
            
            .bottom-panel-status.running {
                background: #d4edda;
                color: #155724;
            }
            
            .bottom-panel-status.paused {
                background: rgba(255, 243, 205, 0.3);
                color: #856404;
            }
            
            [data-theme="dark"] .bottom-panel-status {
                background: #553c3c;
                color: #e2a4a4;
            }
            
            [data-theme="dark"] .bottom-panel-status.running {
                background: #3c5238;
                color: #a4d6a4;
            }
            
            [data-theme="dark"] .bottom-panel-status.paused {
                background: #5c4d1f;
                color: #f0d678;
            }
            
            .bottom-panel-stats {
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            .stat-item {
                font-size: 13px;
                color: var(--panel-text-primary);
                font-weight: 500;
                transition: color 0.3s ease;
            }
            
            .bottom-panel-center {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .keyword-display {
                padding: 4px 12px;
                background: #e7f3ff;
                border-radius: 16px;
                font-size: 12px;
                color: #0c5460;
                font-weight: 500;
                transition: background 0.3s ease, color 0.3s ease;
            }
            
            [data-theme="dark"] .keyword-display {
                background: rgba(99, 179, 237, 0.2);
                color: #63b3ed;
            }
            
            .bottom-panel-right {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .bottom-btn {
                background: rgba(0, 132, 255, 0.1);
                border: 1px solid rgba(0, 132, 255, 0.2);
                color: var(--panel-accent);
                transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 500;
                transition: all 0.2s;
                white-space: nowrap;
            }
            
            .bottom-btn:hover {
                background: rgba(0, 132, 255, 0.2);
                border-color: rgba(0, 132, 255, 0.4);
            }
            
            .bottom-panel-filters {
                padding: 8px 16px;
                background: var(--panel-bg-secondary);
                border-bottom: 1px solid var(--panel-border-primary);
            }
            
            .filter-buttons {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }
            
            .filter-btn {
                background: #e9ecef;
                border: none;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
                color: #495057;
            }
            
            .filter-btn.active {
                background: #0084ff;
                color: white;
            }
            
            .filter-btn:hover:not(.active) {
                background: #dee2e6;
            }
            
            .bottom-panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 12px 16px;
                background: var(--panel-bg-primary);
                min-height: 120px;
                max-height: 200px;
                transition: background 0.3s ease;
            }

            /* Inline Settings Styles */
            .inline-settings {
                background: linear-gradient(135deg, var(--panel-bg-primary), var(--panel-bg-secondary));
                border: 1px solid var(--panel-border-primary);
                transition: background 0.3s ease, border-color 0.3s ease;
                border-radius: 12px;
                margin: 8px 12px;
                overflow: hidden;
                box-shadow: 0 4px 16px var(--panel-shadow);
                backdrop-filter: blur(8px);
                animation: slideIn 0.2s ease-out;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                background: linear-gradient(135deg, #0969da, #0550ae);
                color: white;
                border-bottom: 1px solid var(--panel-border-primary);
            }

            .header-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .header-title {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .logo-icon {
                font-size: 18px;
            }

            .title-text {
                font-size: 16px;
                font-weight: 700;
                margin: 0;
            }

            .version-badge {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 9px;
                font-weight: 600;
            }

            .subtitle {
                font-size: 11px;
                opacity: 0.9;
                font-weight: 500;
            }
            
            .close-settings {
                background: rgba(255, 255, 255, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .close-settings:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-1px);
            }

            .settings-content {
                padding: 10px 12px 0 12px;
                max-height: none;
                overflow: visible;
            }

            /* Compact quick-settings layout */
            .qs-settings-row { display: flex; gap: 12px; margin-bottom: 12px; }
            .qs-compact { flex: 1; display: flex; flex-direction: column; gap: 4px; }
            .qs-compact label { font-size: 11px; color: var(--panel-text-secondary); font-weight: 500; transition: color 0.3s ease; }
            .qs-input { width: 100%; padding: 4px 6px; border: 1px solid var(--panel-border-primary); border-radius: 4px; font-size: 11px; text-align: center; background: var(--panel-bg-primary); color: var(--panel-text-primary); transition: all 0.3s ease; }
            .qs-delay { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--panel-text-secondary); transition: color 0.3s ease; }

            .qs-primary { display: flex; gap: 8px; margin: 0 0 12px 0; }
            .qs-toggle { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 8px; background: var(--panel-bg-secondary); border: 1px solid var(--panel-border-primary); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
            .qs-toggle span { font-size: 11px; font-weight: 600; color: var(--panel-text-primary); transition: color 0.3s ease; }

            .qs-section-title { font-size: 12px; font-weight: 600; color: var(--panel-text-primary); margin: 4px 0 8px; transition: color 0.3s ease; }
            .qs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .qs-mini { display: flex; align-items: center; gap: 6px; padding: 8px; background: var(--panel-bg-secondary); border: 1px solid var(--panel-border-primary); border-radius: 6px; font-size: 11px; color: var(--panel-text-primary); transition: all 0.3s ease; }

            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 12px;
                min-height: 32px;
            }

            .setting-item:last-of-type {
                margin-bottom: 16px;
            }

            .setting-item label {
                color: var(--panel-text-primary);
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: color 0.3s ease;
            }

            .setting-item input[type="number"] {
                width: 50px;
                padding: 4px 6px;
                border: 1px solid var(--panel-border-primary);
                border-radius: 4px;
                font-size: 11px;
                text-align: center;
                background: var(--panel-bg-primary);
                color: var(--panel-text-primary);
                transition: all 0.3s ease;
            }

            .setting-item input[type="checkbox"] {
                margin: 0;
                cursor: pointer;
                transform: scale(0.9);
            }

            .setting-item small {
                display: block;
                color: #6c757d;
                font-size: 9px;
                margin-top: 2px;
                line-height: 1.2;
                max-width: 200px;
            }

            .setting-item label {
                flex-direction: column;
                align-items: flex-start;
            }



            .settings-actions {
                display: flex;
                gap: 8px;
                justify-content: center;
                padding: 10px 12px;
                border-top: 1px solid var(--panel-border-primary);
                background: var(--panel-bg-primary);
                position: relative;
                z-index: 1;
            }

            .save-quick-settings,
            .open-full-settings {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.2s;
                min-width: 120px;
            }

            .save-quick-settings {
                background: linear-gradient(135deg, #1a7f37, #22c55e);
                color: white;
                box-shadow: 0 2px 4px rgba(26, 127, 55, 0.2);
            }

            .save-quick-settings:hover {
                background: linear-gradient(135deg, #166534, #1a7f37);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(26, 127, 55, 0.3);
            }

            .open-full-settings {
                background: linear-gradient(135deg, #0969da, #0550ae);
                color: white;
                box-shadow: 0 2px 4px rgba(9, 105, 218, 0.2);
            }

            .open-full-settings:hover {
                background: linear-gradient(135deg, #0860ca, #0449a0);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(9, 105, 218, 0.3);
            }

            /* Quick Actions Styles */
            .quick-actions-section {
                background: linear-gradient(135deg, var(--panel-bg-secondary), var(--panel-bg-primary));
                border-top: 1px solid var(--panel-border-primary);
                border-bottom: 1px solid var(--panel-border-primary);
                padding: 12px 16px;
                margin: 0;
                transition: background 0.3s ease, border-color 0.3s ease;
            }

            .quick-actions-header {
                font-size: 12px;
                font-weight: 600;
                color: var(--panel-text-primary);
                margin-bottom: 8px;
                text-align: center;
                transition: color 0.3s ease;
            }

            .quick-actions-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
            }

            .quick-action-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 6px 4px;
                border: 1px solid var(--panel-border-primary);
                border-radius: 6px;
                background: linear-gradient(135deg, var(--panel-bg-primary), var(--panel-bg-secondary));
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 10px;
                min-height: 44px;
                box-shadow: 0 1px 3px var(--panel-shadow);
                color: var(--panel-text-primary);
            }

            .quick-action-btn:hover {
                background: linear-gradient(135deg, var(--panel-bg-secondary), var(--panel-bg-tertiary));
                border-color: var(--panel-text-muted);
                transform: translateY(-1px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            }

            .quick-action-btn:active {
                transform: translateY(0);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .quick-action-btn.active {
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                border-color: #28a745;
            }

            .quick-action-btn.paused {
                background: linear-gradient(135deg, #ffc107, #ffca2c);
                color: #212529;
                border-color: #ffc107;
            }

            .quick-action-btn.stopped {
                background: linear-gradient(135deg, #dc3545, #e55a6a);
                color: white;
                border-color: #dc3545;
            }

            .action-icon {
                font-size: 13px;
                margin-bottom: 2px;
                line-height: 1;
            }

            .action-text {
                font-size: 9px;
                font-weight: 500;
                line-height: 1;
                text-align: center;
                color: var(--panel-text-secondary);
                transition: color 0.3s ease;
            }
            
            .log-empty {
                text-align: center;
                color: var(--panel-text-secondary);
                font-style: italic;
                padding: 20px;
                font-size: 13px;
                transition: color 0.3s ease;
            }
            
            .bottom-log-item {
                padding: 6px 12px;
                margin: 3px 0;
                border-radius: 6px;
                border-left: 4px solid var(--panel-border-primary);
                background: var(--panel-bg-secondary);
                font-size: 12px;
                line-height: 1.4;
                display: flex;
                align-items: flex-start;
                gap: 8px;
                transition: all 0.2s;
                color: var(--panel-text-primary);
            }
            
            .bottom-log-item:hover {
                background: var(--panel-bg-tertiary);
            }
            
            .bottom-log-item.info {
                border-left-color: #17a2b8;
                background: rgba(23, 162, 184, 0.1);
            }
            
            .bottom-log-item.success {
                border-left-color: #28a745;
                background: rgba(40, 167, 69, 0.1);
            }
            
            .bottom-log-item.warning {
                border-left-color: #ffc107;
                background: rgba(255, 193, 7, 0.1);
            }
            
            .bottom-log-item.error {
                border-left-color: #dc3545;
                background: rgba(220, 53, 69, 0.1);
            }

            [data-theme="dark"] .bottom-log-item.info {
                background: rgba(23, 162, 184, 0.15);
            }

            [data-theme="dark"] .bottom-log-item.success {
                background: rgba(40, 167, 69, 0.15);
            }

            [data-theme="dark"] .bottom-log-item.warning {
                background: rgba(255, 193, 7, 0.15);
            }

            [data-theme="dark"] .bottom-log-item.error {
                background: rgba(220, 53, 69, 0.15);
            }
            
            .bottom-log-time {
                color: var(--panel-text-secondary);
                font-weight: bold;
                font-size: 10px;
                min-width: 65px;
                flex-shrink: 0;
                font-family: monospace;
                transition: color 0.3s ease;
            }
            
            .bottom-log-content {
                flex: 1;
                word-break: break-word;
                color: var(--panel-text-primary);
                transition: color 0.3s ease;
            }

            /* Old Log Frame Styles (keeping for compatibility) */
            .threadsai-log-frame {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 400px;
                max-height: 500px;
                background: var(--panel-bg-primary);
                border: 2px solid #0084ff;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }
            
            .threadsai-log-frame.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .threadsai-log-frame.minimized .log-frame-content,
            .threadsai-log-frame.minimized .log-frame-filters,
            .threadsai-log-frame.minimized .log-frame-footer {
                display: none;
            }
            
            .log-frame-header {
                background: linear-gradient(135deg, #0084ff, #0056b3);
                color: white;
                padding: 12px 16px;
                border-radius: 6px 6px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
            }
            
            .log-frame-title {
                font-weight: bold;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .log-frame-count {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
            }
            
            .log-frame-controls {
                display: flex;
                gap: 4px;
            }
            
            .log-frame-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.2s;
            }
            
            .log-frame-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .log-frame-filters {
                background: var(--panel-bg-secondary);
                padding: 8px 16px;
                border-bottom: 1px solid var(--panel-border-primary);
            }
            
            .filter-buttons {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }
            
            .filter-btn {
                background: #e9ecef;
                border: none;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .filter-btn.active {
                background: #0084ff;
                color: white;
            }
            
            .filter-btn:hover:not(.active) {
                background: #dee2e6;
            }
            
            .log-frame-content {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
                max-height: 300px;
                min-height: 200px;
            }
            
            .log-frame-empty {
                text-align: center;
                color: #6c757d;
                font-style: italic;
                padding: 40px 20px;
            }
            
            .log-frame-item {
                padding: 8px 12px;
                margin: 4px 0;
                border-radius: 6px;
                border-left: 4px solid var(--panel-border-primary);
                background: var(--panel-bg-secondary);
                font-size: 12px;
                line-height: 1.4;
                display: flex;
                align-items: flex-start;
                gap: 8px;
                color: var(--panel-text-primary);
                transition: all 0.3s ease;
            }
            
            .log-frame-item.info {
                border-left-color: #17a2b8;
                background: rgba(23, 162, 184, 0.1);
            }
            
            .log-frame-item.success {
                border-left-color: #28a745;
                background: rgba(40, 167, 69, 0.1);
            }
            .log-frame-item.error {
                border-left-color: #dc3545;
                background: rgba(220, 53, 69, 0.1);
            }
            
            .log-frame-item-time {
                color: #6c757d;
                font-weight: bold;
                font-size: 10px;
                min-width: 60px;
                flex-shrink: 0;
            }
            
            .log-frame-item-content {
                flex: 1;
                word-break: break-word;
            }
            
            .log-frame-footer {
                background: var(--panel-bg-secondary);
                padding: 8px 16px;
                border-top: 1px solid var(--panel-border-primary);
                border-radius: 0 0 6px 6px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #6c757d;
            }

            

            /* Bottom Panel Content */
            .bottom-panel-content {
                flex: 1;
                padding: 8px 16px 12px;
                overflow-y: auto;
                background: var(--panel-bg-primary);
                border-radius: 0 0 12px 12px;
                font-size: 11px;
                line-height: 1.4;
                min-height: 0;
                max-height: 300px;
            }





            .bottom-log-content {
                flex: 1;
                word-break: break-word;
            }

            /* Bottom Panel Filters */
            .bottom-panel-filters {
                padding: 12px 16px;
                background: var(--panel-bg-secondary);
                border-bottom: 1px solid var(--panel-border-primary);
                flex-shrink: 0;
            }

            .filter-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                justify-content: center;
                margin-bottom: 8px;
            }

            .filter-btn {
                padding: 4px 8px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                background: var(--panel-bg-secondary);
                cursor: pointer;
                font-size: 10px;
                font-weight: 500;
                color: #495057;
                transition: all 0.2s;
                min-width: 45px;
                text-align: center;
            }

            .filter-btn.active {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }

            .filter-btn:hover:not(.active) {
                background: #e9ecef;
                border-color: #adb5bd;
            }
        `;
        
        document.head.appendChild(style);
    }

    createBottomPanel() {
        if (this.bottomPanel) return;

        const bottomPanel = document.createElement('div');
        bottomPanel.className = 'threadsai-bottom-panel';
        bottomPanel.innerHTML = `
            <div class="bottom-panel-header">
                <div class="bottom-panel-left">
                    <div class="bottom-panel-logo"><img src="${chrome.runtime.getURL('ico/icon-48.png')}" alt="ThreadsAI Logo" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;">ThreadsAI</div>
                    <div class="bottom-panel-status" id="bottom-panel-status">${this.t('stopped')}</div>
                    <div class="bottom-panel-stats">
                        <span class="stat-item">💬 <span id="bottom-comments">0</span></span>
                        <span class="stat-item">❤️ <span id="bottom-likes">0</span></span>
                        <span class="stat-item">📊 <span id="bottom-posts">0</span></span>
            </div>
                </div>
                <div class="bottom-panel-center">
                    <div class="keyword-display" id="bottom-keyword-info" style="display: none;">
                        🔍 <span id="bottom-keyword-text">-</span> (<span id="bottom-keyword-progress">0/0</span>)
                    </div>
                </div>
                <div class="bottom-panel-right">
                    <button class="bottom-btn" id="bottom-settings-btn" title="${this.t('settingsBtn')}">⚙️ ${this.t('settingsBtn')}</button>
                    <button class="bottom-btn" id="bottom-filter-btn" title="Фильтр лога">🔍</button>
                    <button class="bottom-btn" id="bottom-clear-btn" title="Очистить лог">🗑️</button>
                    <button class="bottom-btn" id="bottom-minimize-btn" title="Свернуть">➖</button>
                </div>
            </div>
            <div class="bottom-panel-filters" id="bottom-panel-filters" style="display: none;">
                <div class="filter-section">
                    <div class="filter-label">📋 Тип логов:</div>
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-type="all">Все</button>
                        <button class="filter-btn" data-type="info">Инфо</button>
                        <button class="filter-btn" data-type="success">Успех</button>
                        <button class="filter-btn" data-type="warning">Предупреждения</button>
                        <button class="filter-btn" data-type="error">Ошибки</button>
                    </div>
                </div>

            </div>
            <div class="quick-actions-section">
                <div class="quick-actions-header">${this.t('quickActions')}</div>
                <div class="quick-actions-grid">
                    <button class="quick-action-btn" id="quick-start-btn" title="${this.t('startBtn')}">
                        <span class="action-icon">▶️</span>
                        <span class="action-text">${this.t('startBtn')}</span>
                    </button>
                    <button class="quick-action-btn" id="quick-pause-btn" title="${this.t('pauseBtn')}">
                        <span class="action-icon">⏸️</span>
                        <span class="action-text">${this.t('pauseBtn')}</span>
                    </button>
                    <button class="quick-action-btn" id="quick-stop-btn" title="${this.t('stopBtn')}">
                        <span class="action-icon">⏹️</span>
                        <span class="action-text">${this.t('stopBtn')}</span>
                    </button>
                    <button class="quick-action-btn" id="quick-like-btn" title="${this.t('likeBtn')}">
                        <span class="action-icon">❤️</span>
                        <span class="action-text">${this.t('likeBtn')}</span>
                    </button>
                    <button class="quick-action-btn" id="quick-comment-btn" title="${this.t('commentBtn')}">
                        <span class="action-icon">💬</span>
                        <span class="action-text">${this.t('commentBtn')}</span>
                    </button>
                </div>
            </div>
            <div class="bottom-panel-content" id="bottom-panel-content">
                <div class="log-empty">${this.t('logEmpty')}</div>
            </div>
        `;
        
        document.body.appendChild(bottomPanel);
        this.bottomPanel = bottomPanel;
        this.logFrameFilter = 'all';
        this.panelMinimized = false;

        // Show panel immediately
        setTimeout(() => {
            if (this.bottomPanel) {
                this.bottomPanel.classList.add('show');
            }
        }, 100);

        // Bind events
        this.bindQuickActionsEvents();
        
        // Load saved activity log if not already loaded
        if (!this.activityLog || this.activityLog.length === 0) {
            this.loadActivityLog();
        }
        
        // Initialize with ready message only if this is the first creation
        if (!this.bottomPanelInitialized) {
            this.addLogItem(`📋 ${this.t('panelInitialized')}`, 'info');
            this.bottomPanelInitialized = true;
        }
        
        // Update display
        this.updateBottomPanelDisplay();
        
        // Show panel after creation
        setTimeout(() => {
            this.bottomPanel.classList.add('show');
        }, 100);
    }

    bindBottomPanelEvents() {
        if (!this.bottomPanel) return;

        // Settings button
        const settingsBtn = this.bottomPanel.querySelector('#bottom-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                try {
                    this.toggleInlineSettings();
                } catch (error) {
                    console.error('Error opening settings:', error);
                    this.showNotification(this.t('openSettingsError'), 'error');
                }
            });
                } else {
            console.error('Settings button not found');
        }

        // Filter button
        const filterBtn = this.bottomPanel.querySelector('#bottom-filter-btn');
        filterBtn.addEventListener('click', () => {
            const filtersEl = this.bottomPanel.querySelector('#bottom-panel-filters');
            filtersEl.style.display = filtersEl.style.display === 'none' ? 'block' : 'none';
        });

        // Clear button
        const clearBtn = this.bottomPanel.querySelector('#bottom-clear-btn');
        clearBtn.addEventListener('click', () => {
            this.clearActivityLog();
        });

                // Minimize button
        const minimizeBtn = this.bottomPanel.querySelector('#bottom-minimize-btn');
        minimizeBtn.addEventListener('click', () => {
            this.panelMinimized = !this.panelMinimized;
            if (this.panelMinimized) {
                this.bottomPanel.classList.add('minimized');
                minimizeBtn.textContent = '➕';
                minimizeBtn.title = 'Развернуть';
            } else {
                this.bottomPanel.classList.remove('minimized');
                minimizeBtn.textContent = '➖';
                minimizeBtn.title = 'Свернуть';
            }
        });

        // Quick actions buttons
        this.bindQuickActionsEvents();

        // Filter buttons
        const filterBtns = this.bottomPanel.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.logFrameFilter = btn.dataset.type;
                this.updateBottomPanelDisplay();
            });
        });
    }

    bindLogFrameEvents() {
        if (!this.logFrame) return;

        // Filter button
        const filterBtn = this.logFrame.querySelector('#log-frame-filter');
        filterBtn.addEventListener('click', () => {
            const filtersEl = this.logFrame.querySelector('#log-frame-filters');
            filtersEl.style.display = filtersEl.style.display === 'none' ? 'block' : 'none';
        });

        // Clear button
        const clearBtn = this.logFrame.querySelector('#log-frame-clear');
        clearBtn.addEventListener('click', () => {
            this.clearActivityLog();
        });

        // Minimize button
        const minimizeBtn = this.logFrame.querySelector('#log-frame-minimize');
        minimizeBtn.addEventListener('click', () => {
            this.logFrameMinimized = !this.logFrameMinimized;
            if (this.logFrameMinimized) {
                this.logFrame.classList.add('minimized');
                minimizeBtn.textContent = '➕';
                minimizeBtn.title = 'Развернуть';
        } else {
                this.logFrame.classList.remove('minimized');
                minimizeBtn.textContent = '➖';
                minimizeBtn.title = 'Свернуть';
            }
        });

        // Close button
        const closeBtn = this.logFrame.querySelector('#log-frame-close');
        closeBtn.addEventListener('click', () => {
            this.logFrame.classList.remove('show');
            setTimeout(() => {
                if (this.logFrame && this.logFrame.parentNode) {
                    this.logFrame.parentNode.removeChild(this.logFrame);
                    this.logFrame = null;
                }
            }, 300);
        });

        // Filter buttons
        const filterBtns = this.logFrame.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.logFrameFilter = btn.dataset.type;
                this.updateLogFrameDisplay();
            });
        });

        // Make draggable
        this.makeLogFrameDraggable();
    }

    makeLogFrameDraggable() {
        const header = this.logFrame.querySelector('.log-frame-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = this.logFrame.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            
            this.logFrame.style.position = 'fixed';
            this.logFrame.style.zIndex = '10002';
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = Math.max(0, Math.min(window.innerWidth - this.logFrame.offsetWidth, startLeft + deltaX));
            const newTop = Math.max(0, Math.min(window.innerHeight - this.logFrame.offsetHeight, startTop + deltaY));
            
            this.logFrame.style.left = newLeft + 'px';
            this.logFrame.style.top = newTop + 'px';
            this.logFrame.style.right = 'auto';
        };

        const onMouseUp = () => {
            isDragging = false;
            this.logFrame.style.zIndex = '10001';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }





    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `threadsai-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    observePageChanges() {
        // Watch for SPA navigation changes
        let currentUrl = window.location.href;
        
        const observer = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                console.log('Page changed:', currentUrl);
                
                // Reset processed posts on page change
                this.processedPosts.clear();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // New methods for keyword search state management
    async checkAndResumeKeywordSearch() {
        try {
            // First, check if we have saved search state (resuming after reload)
            const result = await chrome.storage.local.get(['keywordSearchState']);
            const searchState = result.keywordSearchState;
            
            const currentUrl = window.location.href;
            const isSearchPage = currentUrl.includes('/search?q=');
            
            // Case 1: Resume existing keyword search after page reload
            if (searchState && searchState.isActive && isSearchPage) {
                console.log('🔎 Resuming keyword search after page reload...');
                console.log('🔄 Restored search state:', searchState);
                
                // Restore state
                this.settings = searchState.settings;
                this.isRunning = true;
                this.isPaused = false;
                // Preserve comments/likes but reset progress for session
                const existing = searchState.stats || {};
                this.stats = {
                    comments: typeof existing.comments === 'number' ? existing.comments : 0,
                    likes: typeof existing.likes === 'number' ? existing.likes : 0,
                    progress: 0, // Reset progress for resumed session
                    startTime: Date.now() // Reset start time for resumed session
                };
                console.log(`📊 Session progress reset on resume: 0/${this.settings.maxPosts} posts`);
                this.processedPosts = new Set(searchState.processedPosts || []);
                
                // Wait a bit for page to fully load
                await this.sleep(2000);
                
                // Create UI elements if they don't exist
                this.createBottomPanel();
                this.updateBottomPanelDisplay();
                this.showNotification(this.t('keywordSearchResumed'), 'info');
                
                // Continue with current keyword processing
                await this.continueKeywordSearchFromState(searchState);
                return;
            }
            
            // Case 2: Check if user has keyword search enabled and auto-start if needed
            await this.checkAutoStartKeywordSearch();
            
        } catch (error) {
            console.error('Error checking keyword search state:', error);
        }
    }

    async checkAutoStartKeywordSearch() {
        try {
            // Get current settings from storage
            const settings = await chrome.storage.sync.get();
            
            // Check if keyword search is enabled in settings and auto-start is allowed
            if (!settings.enableKeywordSearch) {
                console.log('🔎 Keyword search is disabled in settings');
                return;
            }
            if (!settings.autoStartKeywordOnSearchPage) {
                console.log('🔎 Auto-start on search page is disabled');
                return;
            }
            
            const currentUrl = window.location.href;
            const isSearchPage = currentUrl.includes('/search?q=');
            
            // If we're on a search page and keyword search is enabled, 
            // check if this might be an intentional keyword search
            if (isSearchPage) {
                console.log('🔎 On search page with keyword search enabled');
                
                // Extract the search query from URL
                const urlParams = new URLSearchParams(window.location.search);
                const searchQuery = urlParams.get('q');
                
                if (searchQuery && settings.searchKeywords) {
                    const keywords = settings.searchKeywords.filter(k => k.trim().length > 0);
                    
                    // Check if current search query matches one of our keywords
                    const decodedQuery = decodeURIComponent(searchQuery).toLowerCase();
                    const matchingKeyword = keywords.find(keyword => 
                        keyword.toLowerCase() === decodedQuery
                    );
                    
                    if (matchingKeyword) {
                        console.log(`🔎 Current search "${decodedQuery}" matches keyword "${matchingKeyword}"`);
                        console.log('🚀 Auto-starting keyword search mode...');
                        
                        // Auto-start keyword search with this keyword
                        await this.autoStartKeywordSearchFromCurrentPage(settings, matchingKeyword, keywords);
                        return;
                    }
                }
            }
            
            console.log('🔎 No auto-start conditions met');
            
        } catch (error) {
            console.error('Error checking auto-start keyword search:', error);
        }
    }

    async autoStartKeywordSearchFromCurrentPage(settings, currentKeyword, allKeywords) {
        try {
            console.log('🔎 Auto-starting keyword search from current page');
            
            // Set up the extension state
            this.settings = settings;
            this.isRunning = true;
            this.isPaused = false;
            
            // Preserve existing stats if present; otherwise initialize
            const existing = this.stats || {};
            this.stats = {
                comments: typeof existing.comments === 'number' ? existing.comments : 0,
                likes: typeof existing.likes === 'number' ? existing.likes : 0,
                progress: 0, // Reset progress for new keyword search session
                startTime: Date.now() // Reset start time for new session
            };
            console.log('📊 Stats reset for new keyword search session:', this.stats);
            console.log(`📊 Session progress reset: 0/${this.settings.maxPosts} posts`);
            try { chrome.storage.local.set({ persistentStats: { stats: this.stats, savedAt: Date.now() } }); } catch (_) {}
            console.log(`📊 Starting fresh keyword search session`);
            
            if (!this.processedPosts) {
            this.processedPosts = new Set();
            }
            
            // Set up keyword search state
            this.keywords = allKeywords;
            this.currentKeyword = currentKeyword;
            this.currentKeywordIndex = allKeywords.findIndex(k => 
                k.toLowerCase() === currentKeyword.toLowerCase()
            );
            
            if (this.currentKeywordIndex === -1) {
                this.currentKeywordIndex = 0;
                this.currentKeyword = allKeywords[0];
            }
            
            console.log(`🎯 Starting with keyword ${this.currentKeywordIndex + 1}/${this.keywords.length}: "${this.currentKeyword}"`);
            
            // Create UI elements
            this.createBottomPanel();
            this.updateBottomPanelDisplay();
            this.showNotification(this.t('keywordSearchAutoStarted'), 'success');
            
            // Wait for page to load and start processing
            await this.sleep(2000);
            await this.waitForPageLoad();
            
            // Save initial state
            await this.saveKeywordSearchState();
            
            // Start processing current search results
            await this.processSearchResults(this.currentKeyword);
            
        } catch (error) {
            console.error('Error auto-starting keyword search:', error);
            this.showNotification(this.t('keywordAutoStartError'), 'error');
        }
    }

    async saveKeywordSearchState() {
        try {
            const state = {
                isActive: this.isRunning && this.settings.enableKeywordSearch,
                settings: this.settings,
                stats: this.stats,
                processedPosts: Array.from(this.processedPosts),
                timestamp: Date.now(),
                currentKeywordIndex: this.currentKeywordIndex || 0,
                keywords: this.keywords || [],
                currentKeyword: this.currentKeyword || null
            };
            
            await chrome.storage.local.set({ keywordSearchState: state });
            console.log('💾 Saved keyword search state:', state);
            
        } catch (error) {
            console.error('Error saving keyword search state:', error);
        }
    }

    async clearKeywordSearchState() {
        try {
            this.currentKeyword = null;
            this.currentKeywordIndex = 0;
            this.keywords = [];
            this.isProcessingKeywordSearch = false;
            this.currentlyProcessingPosts = new Set();
            
            await chrome.storage.local.remove(['keywordSearchState']);
            console.log('🗑️ Cleared keyword search state');
        } catch (error) {
            console.error('Error clearing keyword search state:', error);
        }
    }

    // Activity Log Functions
    loadActivityLog() {
        try {
            const savedLog = localStorage.getItem('threadsai_activity_log');
            if (savedLog) {
                this.activityLog = JSON.parse(savedLog);
                console.log(`Loaded ${this.activityLog.length} activity log items from storage`);
                
                // Update display if we loaded items
                if (this.activityLog.length > 0) {
                    setTimeout(() => {
                        this.updateLogFrameDisplay();
                    }, 200);
                }
            }
        } catch (error) {
            console.warn('Could not load activity log from localStorage:', error);
            this.activityLog = [];
        }
    }

    addLogItem(message, type = 'info') {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ru-RU', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        const logItem = {
            message,
            type,
            timestamp: timeStr,
            time: now
        };
        
        this.activityLog.push(logItem);
        
        // Keep only last 100 items for better history
        if (this.activityLog.length > 100) {
            this.activityLog = this.activityLog.slice(-100);
        }
        
        // Save to localStorage to persist across page reloads
        try {
            localStorage.setItem('threadsai_activity_log', JSON.stringify(this.activityLog));
        } catch (error) {
            console.warn('Could not save activity log to localStorage:', error);
        }
        
        this.updateLogFrameDisplay();
        this.updateBottomPanelDisplay();
    }
    bindQuickActionsEvents() {
        if (!this.bottomPanel) return;

        // Start button
        const startBtn = this.bottomPanel.querySelector('#quick-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', async () => {
                try {
                    if (!this.isRunning) {
                        const settings = await this.getSettings();
                        await this.start(settings);
                        this.updateQuickActionStates();
                    }
                } catch (error) {
                    console.error('Error starting from quick action:', error);
                    this.showNotification((this.t && this.t('automationError')) || ('Ошибка запуска: ' + error.message), 'error');
                }
            });
        }

        // Pause button
        const pauseBtn = this.bottomPanel.querySelector('#quick-pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                try {
                    if (this.isRunning) {
                        this.pause();
                        this.updateQuickActionStates();
                    } else {
                        this.showNotification(this.t('needStart'), 'warning');
                    }
                } catch (error) {
                    console.error('Error pausing from quick action:', error);
                    this.showNotification((this.t && this.t('automationError')) || ('Ошибка паузы: ' + error.message), 'error');
                }
            });
        }

        // Stop button
        const stopBtn = this.bottomPanel.querySelector('#quick-stop-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                try {
                    if (this.isRunning) {
                        this.stop();
                        this.updateQuickActionStates();
                    } else {
                        this.showNotification(this.t('alreadyStopped'), 'info');
                    }
                } catch (error) {
                    console.error('Error stopping from quick action:', error);
                    this.showNotification((this.t && this.t('automationError')) || ('Ошибка остановки: ' + error.message), 'error');
                }
            });
        }

        // Like button
        const likeBtn = this.bottomPanel.querySelector('#quick-like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', async () => {
                try {
                    const posts = document.querySelectorAll('[data-pressable-container="true"]');
                    if (posts.length > 0) {
                        const success = await this.likePost(posts[0]);
                        if (success) {
                            this.showNotification(this.t('likeSuccess'), 'success');
                            this.addLogItem(this.t('quickLikeAdded'), 'success');
                        } else {
                            this.showNotification(this.t('likeFailed'), 'warning');
                        }
                    } else {
                        this.showNotification(this.t('postsNotFound'), 'warning');
                    }
                } catch (error) {
                    console.error('Error liking from quick action:', error);
                    this.showNotification(this.t('likeError'), 'error');
                }
            });
        }

        // Comment button
        const commentBtn = this.bottomPanel.querySelector('#quick-comment-btn');
        if (commentBtn) {
            commentBtn.addEventListener('click', async () => {
                try {
                    const posts = document.querySelectorAll('[data-pressable-container="true"]');
                    if (posts.length > 0) {
                        // Get current settings to use AI if enabled
                        const settings = await this.getSettings();
                        
                        // Temporarily store settings if not already stored
                        const oldSettings = this.settings;
                        this.settings = settings;
                        
                        const success = await this.postComment(posts[0]);
                        
                        // Restore old settings
                        this.settings = oldSettings;
                        
                        if (success) {
                            this.showNotification(this.t('commentAdded'), 'success');
                            this.addLogItem(this.t('quickCommentAdded'), 'success');
                        } else {
                            this.showNotification(this.t('commentFailed'), 'warning');
                        }
                    } else {
                        this.showNotification(this.t('postsNotFound'), 'warning');
                    }
                } catch (error) {
                    console.error('Error commenting from quick action:', error);
                    this.showNotification(this.t('commentError'), 'error');
                }
            });
        }

        // Stats button removed in compact layout

        // Filter buttons for logs
        const filterBtns = this.bottomPanel.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all filter buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update filter
                this.logFrameFilter = btn.dataset.type;
                this.updateBottomPanelDisplay();
            });
        });



        // Other panel buttons
        const settingsBtn = this.bottomPanel.querySelector('#bottom-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                try {
                    this.toggleInlineSettings();
                } catch (error) {
                    console.error('Error opening settings:', error);
                    this.showNotification(this.t('openSettingsError'), 'error');
                }
            });
        }

        const filterBtn = this.bottomPanel.querySelector('#bottom-filter-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                const filtersEl = this.bottomPanel.querySelector('#bottom-panel-filters');
                if (filtersEl) {
                    filtersEl.style.display = filtersEl.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        const clearBtn = this.bottomPanel.querySelector('#bottom-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearActivityLog();
            });
        }

        const minimizeBtn = this.bottomPanel.querySelector('#bottom-minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.panelMinimized = !this.panelMinimized;
                if (this.panelMinimized) {
                    this.bottomPanel.classList.add('minimized');
                    minimizeBtn.textContent = '➕';
                    minimizeBtn.title = 'Развернуть';
                } else {
                    this.bottomPanel.classList.remove('minimized');
                    minimizeBtn.textContent = '➖';
                    minimizeBtn.title = 'Свернуть';
                }
            });
        }
    }

    updateQuickActionStates() {
        if (!this.bottomPanel) return;

        const startBtn = this.bottomPanel.querySelector('#quick-start-btn');
        const pauseBtn = this.bottomPanel.querySelector('#quick-pause-btn');
        const stopBtn = this.bottomPanel.querySelector('#quick-stop-btn');

        // Reset all states
        [startBtn, pauseBtn, stopBtn].forEach(btn => {
            if (btn) {
                btn.classList.remove('active', 'paused', 'stopped');
            }
        });

        if (this.isRunning) {
            if (this.isPaused) {
                if (pauseBtn) {
                    pauseBtn.classList.add('paused');
                    pauseBtn.querySelector('.action-text').textContent = 'Продолжить';
                    pauseBtn.querySelector('.action-icon').textContent = '▶️';
                }
            } else {
                if (startBtn) startBtn.classList.add('active');
                if (pauseBtn) {
                    pauseBtn.classList.add('active');
                    pauseBtn.querySelector('.action-text').textContent = 'Пауза';
                    pauseBtn.querySelector('.action-icon').textContent = '⏸️';
                }
            }
        } else {
            if (stopBtn) stopBtn.classList.add('stopped');
            if (pauseBtn) {
                pauseBtn.querySelector('.action-text').textContent = 'Пауза';
                pauseBtn.querySelector('.action-icon').textContent = '⏸️';
            }
        }
    }

    clearActivityLog() {
        this.activityLog = [];
        localStorage.removeItem('threadsai_activity_log');
        this.addLogItem('🗑️ Лог очищен', 'info');
    }

    // Parse date from post element and return minutes ago
    parsePostDate(postElement) {
        try {
            // Look for time indicators in the post
            const timeElements = postElement.querySelectorAll('a, span, div');
            
            for (const el of timeElements) {
                const text = el.textContent.trim();
                
                // Russian patterns
                if (text.match(/^\d+\s*мин\.?$/)) {
                    return parseInt(text.match(/\d+/)[0]);
                }
                if (text.match(/^\d+\s*ч\.?$/)) {
                    return parseInt(text.match(/\d+/)[0]) * 60;
                }
                if (text.match(/^\d+\s*дн\.?$/)) {
                    return parseInt(text.match(/\d+/)[0]) * 24 * 60;
                }
                if (text.match(/^\d+\s*год\.?$/)) {
                    return parseInt(text.match(/\d+/)[0]) * 365 * 24 * 60;
                }
                
                // English patterns
                if (text.match(/^\d+m$/)) {
                    return parseInt(text.match(/\d+/)[0]);
                }
                if (text.match(/^\d+h$/)) {
                    return parseInt(text.match(/\d+/)[0]) * 60;
                }
                if (text.match(/^\d+d$/)) {
                    return parseInt(text.match(/\d+/)[0]) * 24 * 60;
                }
                
                // Absolute dates (considered old - return large number)
                if (text.match(/^\d{2}\.\d{2}\.\d{4}$/) || text.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
                    return 365 * 24 * 60; // 1 year in minutes
                }
            }
            
            // If no date found, assume it's recent
            return 0;
        } catch (error) {
            console.error('Error parsing post date:', error);
            return 0;
        }
    }

    // Check if post matches date filter based on settings
    isPostWithinDateFilter(postElement) {
        // Check if date filter is enabled in settings
        if (!this.settings.enableDateFilter) {
            console.log('📅 Date filter disabled in settings');
            return true;
        }
        
        const hoursAgo = this.parsePostDate(postElement) / 60; // Convert minutes to hours
        const fromHours = this.settings.dateFilterFrom || 0;
        const toHours = this.settings.dateFilterTo || 24;
        
        console.log(`📅 Date filter check: post ${hoursAgo.toFixed(1)}h ago, range: ${fromHours}-${toHours}h`);
        
        // Post is within range if its age is between "from" and "to" hours
        const withinRange = hoursAgo >= fromHours && hoursAgo <= toHours;
        
        if (!withinRange) {
            console.log(`📅 Post filtered out: ${hoursAgo.toFixed(1)}h ago is outside range ${fromHours}-${toHours}h`);
        } else {
            console.log(`📅 Post passed date filter: ${hoursAgo.toFixed(1)}h ago is within range ${fromHours}-${toHours}h`);
        }
        
        return withinRange;
    }



    // Find posts on the current page
    findPosts() {
        const selectors = [
            '[role="article"]',
            '[data-testid*="post"]', 
            '[data-testid*="thread"]',
            'article',
            '[data-pressable-container="true"]',
            'div[data-pressable-container="true"]',
            'div[tabindex="0"]', // Threads.com clickable posts
            'div[role="button"][tabindex="0"]', // Interactive post containers
            '.x1i10hfl.xjbqb8w', // Meta's common classes
            'div[class*="x1n2onr6"]', // Threads specific classes
        ];
        
        let posts = [];
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`Selector "${selector}" found ${elements.length} elements`);
            
            if (elements.length > 0) {
                // Validate posts to make sure they look like actual posts
                const validPosts = Array.from(elements).filter(post => {
                    const hasText = post.textContent && post.textContent.trim().length > 10;
                    const looksLikePost = this.looksLikePost(post);
                    const hasButtons = post.querySelectorAll('[role="button"], button').length > 0;
                    
                    console.log(`✅ Valid post found: hasText=${hasText}, looksLikePost=${looksLikePost}, hasButtons=${hasButtons}`);
                    
                    return hasText && looksLikePost && hasButtons;
                });
                
                if (validPosts.length > 0) {
                    console.log(`Using selector: ${selector}`);
                    posts = validPosts;
                    break;
                }
            }
        }
        
        console.log(`Found ${posts.length} posts on page`);
        return posts;
    }

    // Check if element looks like a real post
    looksLikePost(element) {
        try {
            // Basic checks for post-like structure
            const hasInteractiveElements = element.querySelectorAll('[role="button"], button, [tabindex]').length > 0;
            const hasTextContent = element.textContent && element.textContent.trim().length > 20;
            const hasAriaLabels = element.querySelectorAll('[aria-label]').length > 0;
            
            // Check for typical post elements
            const hasEngagementButtons = Array.from(element.querySelectorAll('[aria-label], [title]')).some(el => {
                const label = (el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase();
                return label.includes('like') || label.includes('comment') || label.includes('reply') ||
                       label.includes('лайк') || label.includes('нравится') || label.includes('комментар') ||
                       label.includes('ответ') || label.includes('поделиться');
            });
            
            return hasInteractiveElements && hasTextContent && (hasAriaLabels || hasEngagementButtons);
        } catch (error) {
            console.error('Error checking if element looks like post:', error);
            return true; // Default to true if check fails
        }
    }

    toggleInlineSettings() {
        if (!this.bottomPanel) {
            console.error('Bottom panel not found');
            this.showNotification(this.t('panelNotFound'), 'error');
            return;
        }

        const existingSettings = this.bottomPanel.querySelector('.inline-settings');
        
        if (existingSettings) {
            // Hide settings
            existingSettings.remove();
            // Restore panel constraints
            this.bottomPanel.classList.remove('expanded');
            this.showNotification(this.t('settingsClosed'), 'info');
        } else {
            // Show settings
            try {
                this.createInlineSettings();
                this.showNotification(this.t('settingsOpened'), 'success');
            } catch (error) {
                console.error('Error creating inline settings:', error);
                this.showNotification(this.t('openSettingsError'), 'error');
            }
        }
    }

    async getSettings() {
        try {
            const result = await chrome.storage.sync.get();
            
            // Build complete settings object with proper defaults
            const settings = {
                // Basic settings with defaults
                maxPosts: result.maxPosts !== undefined ? result.maxPosts : 50,
                minDelay: result.minDelay !== undefined ? result.minDelay : 30,
                maxDelay: result.maxDelay !== undefined ? result.maxDelay : 120,
                autoLike: result.autoLike !== undefined ? result.autoLike : true,
                autoComment: result.autoComment !== undefined ? result.autoComment : true,
                stealthMode: result.stealthMode !== undefined ? result.stealthMode : true,
                
                // Advanced settings
                enableKeywordSearch: result.enableKeywordSearch || false,
                // Explicit opt-in flag to start keyword search automatically
                autoStartKeywordOnSearchPage: result.autoStartKeywordOnSearchPage !== undefined ? result.autoStartKeywordOnSearchPage : false,
                keywords: result.keywords || [],
                comments: result.comments || ['Отличный пост! 👍', 'Спасибо за информацию!', 'Интересная мысль 🤔'],
                
                // AI settings
                aiEnabled: result.aiEnabled !== undefined ? result.aiEnabled : false,
                aiProvider: result.aiProvider || 'openrouter',
                aiModel: result.aiModel || 'openai/gpt-4o-mini',
                openaiApiKey: result.openaiApiKey || '',
                openrouterApiKey: result.openrouterApiKey || '',
                aiPrompt: result.aiPrompt || 'Ты должен написать короткий релевантный комментарий к посту на русском языке. Комментарий должен быть естественным, дружелюбным и по теме. Избегай спама и повторов.\nНапиши только комментарий, без лишних пояснений:',
                
                        // Rate limiting
        actionsPerHour: result.actionsPerHour !== undefined ? result.actionsPerHour : 15,
        respectLimits: result.respectLimits !== undefined ? result.respectLimits : true,
        avoidDuplicates: result.avoidDuplicates !== undefined ? result.avoidDuplicates : true,
        avoidDuplicateUsers: result.avoidDuplicateUsers !== undefined ? result.avoidDuplicateUsers : false,
                
                // Date filter settings
                enableDateFilter: result.enableDateFilter !== undefined ? result.enableDateFilter : false,
                dateFilterFrom: result.dateFilterFrom !== undefined ? result.dateFilterFrom : 0,
                dateFilterTo: result.dateFilterTo !== undefined ? result.dateFilterTo : 24,
                maxScrollAttempts: result.maxScrollAttempts !== undefined ? result.maxScrollAttempts : 20,
                
                // Language filter settings
                enableLanguageFilter: result.enableLanguageFilter !== undefined ? result.enableLanguageFilter : false,
                allowedLanguages: result.allowedLanguages || [], // По умолчанию нет белого списка
                excludedLanguages: result.excludedLanguages || [], // По умолчанию никаких исключений
                
                // User filter settings
                enableUserFilter: result.enableUserFilter !== undefined ? result.enableUserFilter : false,
                onlyVerified: result.onlyVerified !== undefined ? result.onlyVerified : false,
                excludeVerified: result.excludeVerified !== undefined ? result.excludeVerified : false,
                onlyWithAvatar: result.onlyWithAvatar !== undefined ? result.onlyWithAvatar : false,
                excludeWithAvatar: result.excludeWithAvatar !== undefined ? result.excludeWithAvatar : false,
                
                // UI settings
                notifications: result.notifications !== undefined ? result.notifications : true,
                autoStart: result.autoStart !== undefined ? result.autoStart : false,
                theme: result.theme || 'light',
                
                // Copy any additional settings that might exist
                ...Object.fromEntries(
                    Object.entries(result).filter(([key]) => 
                        !['maxPosts', 'minDelay', 'maxDelay', 'autoLike', 'autoComment', 'stealthMode', 
                          'enableKeywordSearch', 'autoStartKeywordOnSearchPage', 'keywords', 'comments', 'aiEnabled', 'aiProvider', 
                          'aiModel', 'openaiApiKey', 'openrouterApiKey', 'aiPrompt', 'actionsPerHour', 
                          'respectLimits', 'avoidDuplicates', 'notifications', 'autoStart', 'theme',
                          'enableDateFilter', 'dateFilterFrom', 'dateFilterTo', 'maxScrollAttempts',
                          'enableLanguageFilter', 'allowedLanguages', 'excludedLanguages', 'enableUserFilter', 'onlyVerified',
                          'excludeVerified', 'onlyWithAvatar', 'excludeWithAvatar'].includes(key)
                    )
                )
            };
            
            console.log('📋 Loaded settings:', settings);
            return settings;
            
        } catch (error) {
            console.error('Error getting settings:', error);
            // Return default settings
            return {
                maxPosts: 50,
                minDelay: 30,
                maxDelay: 120,
                autoLike: true,
                autoComment: true,
                stealthMode: true,
                enableKeywordSearch: false,
                autoStartKeywordOnSearchPage: false,
                keywords: [],
                comments: ['Отличный пост! 👍', 'Спасибо за информацию!', 'Интересная мысль 🤔'],
                aiEnabled: false,
                aiProvider: 'openrouter',
                aiModel: 'openai/gpt-4o-mini',
                openaiApiKey: '',
                openrouterApiKey: '',
                aiPrompt: 'Ты должен написать короткий релевантный комментарий к посту на русском языке. Комментарий должен быть естественным, дружелюбным и по теме. Избегай спама и повторов.\nНапиши только комментарий, без лишних пояснений:',
                actionsPerHour: 15,
                respectLimits: true,
                avoidDuplicates: true,
                notifications: true,
                autoStart: false,
                theme: 'light',
                enableDateFilter: false,
                dateFilterFrom: 0,
                dateFilterTo: 24,
                maxScrollAttempts: 20,
                enableLanguageFilter: false,
                allowedLanguages: [],
                excludedLanguages: [],
                enableUserFilter: false,
                onlyVerified: false,
                excludeVerified: false,
                onlyWithAvatar: false,
                excludeWithAvatar: false
            };
        }
    }

    async createInlineSettings() {
        // Get current settings
        const settings = await this.getSettings();
        
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'inline-settings';
        settingsPanel.innerHTML = `
            <div class="settings-header">
                <div class="header-info">
                    <div class="header-title">
                        <span class="logo-icon">🤖</span>
                        <span class="title-text">ThreadsAI</span>
                        <span class="version-badge">v5.23</span>
                    </div>
                    <span class="subtitle">${this.t('quickSettings')}</span>
                </div>
                <button class="close-settings">✕</button>
            </div>
            <div class="settings-content">
                <!-- Row 1: numbers -->
                <div class="qs-settings-row">
                    <div class="qs-compact">
                        <label>${this.t('posts')}</label>
                        <input type="number" id="quick-max-posts" value="${settings.maxPosts || 50}" min="1" max="500" class="qs-input">
                    </div>
                    <div class="qs-compact">
                        <label>${this.t('delay')}</label>
                        <div class="qs-delay">
                            <input type="number" id="quick-min-delay" value="${settings.minDelay || 30}" min="5" max="300" class="qs-input">
                            <span>-</span>
                            <input type="number" id="quick-max-delay" value="${settings.maxDelay || 120}" min="10" max="600" class="qs-input">
                            <span>${this.t('sec')}</span>
                        </div>
                    </div>
                    <div class="qs-compact">
                        <label>${this.t('actionsPerHour')}</label>
                        <input type="number" id="actionsPerHourQuick" value="${settings.actionsPerHour || 15}" min="1" max="50" class="qs-input">
                    </div>
                </div>

                <!-- Row 2: primary toggles -->
                <div class="qs-primary">
                    <label class="qs-toggle">
                        <input type="checkbox" id="quick-auto-like" ${settings.autoLike ? 'checked' : ''}>
                        <span>${this.t('autoLikes')}</span>
                    </label>
                    <label class="qs-toggle">
                        <input type="checkbox" id="quick-stealth-mode" ${settings.stealthMode ? 'checked' : ''}>
                        <span>${this.t('stealthMode')}</span>
                    </label>
                </div>

                <!-- Row 3: filters grid -->
                <div class="qs-section-title">${this.t('filters')}</div>
                <div class="qs-grid">
                    <label class="qs-mini">
                        <input type="checkbox" id="quick-enable-post-filter" ${settings.enablePostFilter ? 'checked' : ''}>
                        <span>${this.t('postsFilter')}</span>
                    </label>
                    <label class="qs-mini">
                        <input type="checkbox" id="quick-enable-language-filter" ${settings.enableLanguageFilter ? 'checked' : ''}>
                        <span>${this.t('languagesFilter')}</span>
                    </label>
                    <label class="qs-mini">
                        <input type="checkbox" id="quick-enable-user-filter" ${settings.enableUserFilter ? 'checked' : ''}>
                        <span>${this.t('usersFilter')}</span>
                    </label>
                    <label class="qs-mini">
                        <input type="checkbox" id="quick-avoid-duplicates" ${settings.avoidDuplicates ? 'checked' : ''}>
                        <span>${this.t('duplicatesFilter')}</span>
                    </label>
                    <label class="qs-mini">
                        <input type="checkbox" id="quick-avoid-duplicate-users" ${settings.avoidDuplicateUsers ? 'checked' : ''}>
                        <span>${this.t('uniqueUsers')}</span>
                    </label>
                </div>

                <div class="settings-actions">
                    <button class="save-quick-settings">${this.t('save')}</button>
                    <button class="open-full-settings">${this.t('fullSettings')}</button>
                </div>
            </div>
        `;
        
        // Insert before the content area
        const contentArea = this.bottomPanel.querySelector('.bottom-panel-content');
        this.bottomPanel.insertBefore(settingsPanel, contentArea);
        // Allow panel to expand vertically for full settings view
        try {
            this.bottomPanel.classList.add('expanded');
        } catch (_) {}
        
        // Bind events
        this.bindInlineSettingsEvents(settingsPanel);
    }

    bindInlineSettingsEvents(settingsPanel) {
        // Close button
        const closeBtn = settingsPanel.querySelector('.close-settings');
        closeBtn.addEventListener('click', () => {
            this.toggleInlineSettings();
        });
        
        // Save button
        const saveBtn = settingsPanel.querySelector('.save-quick-settings');
        saveBtn.addEventListener('click', () => {
            this.saveQuickSettings();
        });
        

        
        // Open full settings button
        const fullBtn = settingsPanel.querySelector('.open-full-settings');
        fullBtn.addEventListener('click', () => {
            // Send message to background to open settings.html
            chrome.runtime.sendMessage({ 
                type: 'openFullSettings' 
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('Ошибка отправки сообщения:', chrome.runtime.lastError);
                    this.showNotification(this.t('clickExtensionIconForSettings'), 'info');
                } else if (response && response.error) {
                    console.log('Ошибка background script:', response.error);
                    this.showNotification(this.t('openSettingsError'), 'error');
                } else {
                    this.showNotification(this.t('fullSettingsOpened'), 'success');
                }
            });
        });
    }

    async saveQuickSettings() {
        try {
            const maxPosts = parseInt(document.getElementById('quick-max-posts').value) || 50;
            const minDelay = parseInt(document.getElementById('quick-min-delay').value) || 30;
            const maxDelay = parseInt(document.getElementById('quick-max-delay').value) || 120;
            const actionsPerHour = parseInt(document.getElementById('actionsPerHourQuick')?.value) || (this.settings.actionsPerHour || 15);
            const autoLike = document.getElementById('quick-auto-like').checked;
            const stealthMode = document.getElementById('quick-stealth-mode').checked;
            const enablePostFilter = document.getElementById('quick-enable-post-filter').checked;
            const enableLanguageFilter = document.getElementById('quick-enable-language-filter').checked;
            const enableUserFilter = document.getElementById('quick-enable-user-filter').checked;
            const avoidDuplicates = document.getElementById('quick-avoid-duplicates').checked;
            const avoidDuplicateUsers = document.getElementById('quick-avoid-duplicate-users').checked;
            
            const newSettings = {
                maxPosts,
                minDelay,
                maxDelay,
                autoLike,
                stealthMode,
                enablePostFilter,
                enableLanguageFilter,
                enableUserFilter,
                avoidDuplicates,
                avoidDuplicateUsers,
                actionsPerHour
            };
            
            await chrome.storage.sync.set(newSettings);
            this.settings = { ...this.settings, ...newSettings };
            
            this.showNotification(this.t('settingsSaved'), 'success');
            this.addLogItem('⚙️ Настройки обновлены', 'info');
            
        } catch (error) {
            console.error('Error saving quick settings:', error);
            this.showNotification(this.t('settingsSaveError'), 'error');
        }
    }

    updateBottomPanelDisplay() {
        if (!this.bottomPanel) return;

        // Update status
        const statusEl = this.bottomPanel.querySelector('#bottom-panel-status');
        if (statusEl) {
            if (this.isRunning) {
                if (this.isPaused) {
                    statusEl.textContent = this.t('paused');
                    statusEl.className = 'bottom-panel-status paused';
                } else {
                    statusEl.textContent = this.t('running');
                    statusEl.className = 'bottom-panel-status running';
                }
            } else {
                statusEl.textContent = this.t('stopped');
                statusEl.className = 'bottom-panel-status';
            }
        }

        // Update stats
        const commentsEl = this.bottomPanel.querySelector('#bottom-comments');
        const likesEl = this.bottomPanel.querySelector('#bottom-likes');
        const postsEl = this.bottomPanel.querySelector('#bottom-posts');
        
        if (commentsEl) commentsEl.textContent = this.stats.comments || 0;
        if (likesEl) likesEl.textContent = this.stats.likes || 0;
        if (postsEl) postsEl.textContent = this.stats.progress || 0;

        // Update keyword info
        const keywordInfoEl = this.bottomPanel.querySelector('#bottom-keyword-info');
        const keywordTextEl = this.bottomPanel.querySelector('#bottom-keyword-text');
        const keywordProgressEl = this.bottomPanel.querySelector('#bottom-keyword-progress');
        
        if (this.currentKeyword && this.keywords) {
            if (keywordInfoEl) keywordInfoEl.style.display = 'block';
            if (keywordTextEl) keywordTextEl.textContent = this.currentKeyword;
            if (keywordProgressEl) {
                const current = (this.currentKeywordIndex || 0) + 1;
                const total = this.keywords.length;
                keywordProgressEl.textContent = `${current}/${total}`;
            }
        } else {
            if (keywordInfoEl) keywordInfoEl.style.display = 'none';
        }

        // Update log content
        const contentEl = this.bottomPanel.querySelector('#bottom-panel-content');
        if (!contentEl) return;

        // Filter logs based on current filter
        let filteredLogs = this.activityLog;
        if (this.logFrameFilter !== 'all') {
            filteredLogs = this.activityLog.filter(log => log.type === this.logFrameFilter);
        }

        // Render logs
        if (filteredLogs.length === 0) {
            contentEl.innerHTML = '<div class="log-empty">Лог пуст</div>';
        } else {
            // Show last 100 items for better performance
            const recentLogs = filteredLogs.slice(-100);
            contentEl.innerHTML = recentLogs.map(log => `
                <div class="bottom-log-item ${log.type}">
                    <div class="bottom-log-time">${log.timestamp}</div>
                    <div class="bottom-log-content">${log.message}</div>
                </div>
            `).join('');
        }

        // Auto-scroll to bottom
        contentEl.scrollTop = contentEl.scrollHeight;
    }

    updateLogFrameDisplay() {
        if (!this.logFrame) return;

        const contentEl = this.logFrame.querySelector('#log-frame-content');
        const countEl = this.logFrame.querySelector('#log-frame-count');
        const statusEl = this.logFrame.querySelector('#log-frame-status');
        const timeEl = this.logFrame.querySelector('#log-frame-time');

        if (!contentEl) return;

        // Filter logs based on current filter
        let filteredLogs = this.activityLog;
        if (this.logFrameFilter !== 'all') {
            filteredLogs = this.activityLog.filter(log => log.type === this.logFrameFilter);
        }

        // Update count
        countEl.textContent = filteredLogs.length;

        // Update status and time
        statusEl.textContent = this.isRunning ? (this.isPaused ? this.t('paused') : this.t('running')) : this.t('stopped');
        timeEl.textContent = new Date().toLocaleTimeString('ru-RU');

        // Render logs
        if (filteredLogs.length === 0) {
            contentEl.innerHTML = '<div class="log-frame-empty">Лог пуст</div>';
        } else {
            // Show last 50 items for better performance
            const recentLogs = filteredLogs.slice(-50);
            contentEl.innerHTML = recentLogs.map(log => `
                <div class="log-frame-item ${log.type}">
                    <div class="log-frame-item-time">${log.timestamp}</div>
                    <div class="log-frame-item-content">${log.message}</div>
                </div>
            `).join('');
        }

        // Auto-scroll to bottom
        contentEl.scrollTop = contentEl.scrollHeight;
    }
    async continueKeywordSearchFromState(searchState) {
        // Prevent multiple simultaneous executions
        if (this.isProcessingKeywordSearch) {
            console.log('⚠️ Keyword search already in progress, skipping duplicate call');
            return;
        }
        
        try {
            this.isProcessingKeywordSearch = true;
            
            // Restore keywords and current position
            this.keywords = searchState.keywords || [];
            this.currentKeywordIndex = searchState.currentKeywordIndex || 0;
            this.currentKeyword = searchState.currentKeyword;
            
            console.log(`🔄 Continuing with keyword ${this.currentKeywordIndex + 1}/${this.keywords.length}: "${this.currentKeyword}"`);
            
            // Send keyword progress update
            chrome.runtime.sendMessage({
                type: 'keywordProgress',
                currentKeyword: this.currentKeyword,
                currentKeywordIndex: this.currentKeywordIndex,
                totalKeywords: this.keywords.length
            });
            
            // Wait for search results to load
            await this.waitForPageLoad();
            
            // Process current search results
            if (this.currentKeyword) {
                await this.processSearchResults(this.currentKeyword);
            }
            
        } catch (error) {
            console.error('Error continuing keyword search:', error);
            await this.clearKeywordSearchState();
        } finally {
            this.isProcessingKeywordSearch = false;
        }
    }

    async finishKeywordSearch() {
        console.log('✅ Keyword search cycle completed');
        
        // Handle cyclic search
        if (this.settings.cyclicSearch && this.isRunning) {
            // Check global limit before restarting cycle
            if (this.stats.progress >= this.settings.maxPosts) {
                console.log(`🎯 Global limit reached (${this.stats.progress}/${this.settings.maxPosts}), stopping cyclic search`);
                this.showNotification(this.t('limitReached').replace('{count}', this.settings.maxPosts), 'success');
                this.stop();
                return;
            }
            
            console.log('🔄 Cyclic search enabled, restarting cycle...');
            await this.loggedSleep(5000, 'перед перезапуском циклического поиска');
            
            // Reset to first keyword
            this.currentKeywordIndex = 0;
            
            // DON'T reset stats for cyclic search - they should accumulate across cycles
            console.log(`📊 Cyclic search: preserving stats across cycles (progress: ${this.stats.progress}, comments: ${this.stats.comments}, likes: ${this.stats.likes})`);
            
            // Restart keyword search from beginning
            await this.processKeywords(this.keywords);
        } else {
            // Stop automation when keyword search is completed
            console.log('🛑 Stopping automation after keyword search completion');
            this.showNotification(this.t('keywordSearchFinished'), 'success');
            await this.clearKeywordSearchState();
            
            // Stop the automation completely
            this.stop();
        }
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.threadsAI = new ThreadsAIContentScript();
    });
} else {
    window.threadsAI = new ThreadsAIContentScript();
}