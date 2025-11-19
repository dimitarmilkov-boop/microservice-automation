// ThreadsAI Extension Background Script
class ThreadsAIBackground {
    constructor() {
        this.init();
    }

    init() {
        console.log('ThreadsAI Background Script initialized');
        
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // Handle messages from content script and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep the message channel open
        });

        // Handle tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // Handle browser action click (for browsers without popup support)
        chrome.action.onClicked.addListener((tab) => {
            this.handleActionClick(tab);
        });

        // Set up periodic cleanup
        this.setupPeriodicTasks();
    }

    async handleInstallation(details) {
        console.log('Extension installed/updated:', details.reason);
        
        if (details.reason === 'install') {
            // First time installation
            await this.setDefaultSettings();
            await this.showWelcomeNotification();
        } else if (details.reason === 'update') {
            // Extension updated
            await this.handleUpdate(details.previousVersion);
        }
    }

    async setDefaultSettings() {
        const defaultSettings = {
            maxPosts: 50,
            minDelay: 30,
            maxDelay: 120,
            autoLike: true,
            stealthMode: true,
            respectLimits: true,
            avoidDuplicates: true,
            actionsPerHour: 15,
            comments: [
                'Отличный пост! 👍',
                'Спасибо за информацию!',
                'Интересная мысль 🤔',
                'Согласен с вами! 💯',
                'Классный контент! 🔥',
                'Вдохновляет! ✨',
                'Полезная информация!',
                'Благодарю за контент!'
            ],
            notifications: true,
            autoStart: false,
            theme: 'light'
        };

        await chrome.storage.sync.set(defaultSettings);
        console.log('Default settings saved');
    }

    async showWelcomeNotification() {
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'ico/icon-48.png',
                title: 'ThreadsAI установлен!',
                message: 'Перейдите на threads.net и откройте расширение для начала работы.'
            });
        }
    }

    async handleUpdate(previousVersion) {
        console.log(`Updated from version ${previousVersion}`);
        
        // Handle version-specific updates
        const currentVersion = chrome.runtime.getManifest().version;
        
        // Migration logic can go here
        if (this.isVersionLower(previousVersion, '5.0.0')) {
            await this.migrateToV5();
        }
    }

    isVersionLower(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part < v2part) return true;
            if (v1part > v2part) return false;
        }
        
        return false;
    }

    async migrateToV5() {
        // Migration logic for version 5.0
        console.log('Migrating to version 5.0+');
        
        // Add new default settings
        const newSettings = {
            stealthMode: true,
            respectLimits: true,
            theme: 'light'
        };
        
        await chrome.storage.sync.set(newSettings);
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'statsUpdate':
                this.handleStatsUpdate(message, sender);
                break;
                
            case 'statusUpdate':
                this.handleStatusUpdate(message, sender);
                break;
                
            case 'getSettings':
                this.getSettings().then(settings => {
                    sendResponse({ settings });
                });
                return true;
                
            case 'saveSettings':
                this.saveSettings(message.settings).then(() => {
                    sendResponse({ success: true });
                });
                return true;
                
            case 'exportStats':
                this.exportStats().then(stats => {
                    sendResponse({ stats });
                });
                return true;
                
            case 'getKeywordSearchState':
                this.getKeywordSearchState().then(state => {
                    sendResponse({ state });
                });
                return true;
                
            case 'saveKeywordSearchState':
                this.saveKeywordSearchState(message.state).then(() => {
                    sendResponse({ success: true });
                });
                return true;
                
            case 'clearKeywordSearchState':
                this.clearKeywordSearchState().then(() => {
                    sendResponse({ success: true });
                });
                return true;
                
            case 'openSettings':
                this.openSettings(sender).then(() => {
                    sendResponse({ success: true });
                }).catch((error) => {
                    sendResponse({ error: error.message });
                });
                return true;
                
            case 'openFullSettings':
                this.openFullSettings().then(() => {
                    sendResponse({ success: true });
                }).catch((error) => {
                    sendResponse({ error: error.message });
                });
                return true;
                
            default:
                sendResponse({ error: 'Unknown message type' });
        }
    }

    async handleStatsUpdate(message, sender) {
        // Save stats to storage
        await chrome.storage.local.set({
            stats: message.stats,
            lastUpdate: Date.now()
        });

        // Update badge with current progress
        if (sender.tab) {
            this.updateBadge(sender.tab.id, message.stats.progress);
        }
    }

    async handleStatusUpdate(message, sender) {
        console.log('Status update:', message.status);
        
        if (sender.tab) {
            if (message.status === 'stopped') {
                // Clear badge when stopped
                chrome.action.setBadgeText({
                    text: '',
                    tabId: sender.tab.id
                });
            }
        }
    }

    updateBadge(tabId, progress) {
        if (progress > 0) {
            chrome.action.setBadgeText({
                text: progress.toString(),
                tabId: tabId
            });
            
            chrome.action.setBadgeBackgroundColor({
                color: '#007bff',
                tabId: tabId
            });
        }
    }

    async handleTabUpdate(tabId, changeInfo, tab) {
        // Reset badge when navigating away from Threads
        if (changeInfo.url && !changeInfo.url.includes('threads.net') && !changeInfo.url.includes('threads.com')) {
            chrome.action.setBadgeText({
                text: '',
                tabId: tabId
            });
            
            // Clear keyword search state when leaving Threads
            const searchState = await this.getKeywordSearchState();
            if (searchState && searchState.isActive) {
                console.log('🔎 User navigated away from Threads, clearing keyword search state');
                await this.clearKeywordSearchState();
            }
        }
        
        // Handle keyword search state restoration on Threads pages
        if (changeInfo.status === 'complete' && tab.url && 
            (tab.url.includes('threads.net') || tab.url.includes('threads.com'))) {
            
            // Check if there's an active keyword search that needs to continue
            const searchState = await this.getKeywordSearchState();
            if (searchState && searchState.isActive) {
                console.log('🔎 Threads page loaded, checking if keyword search should continue...');
                
                // Send message to content script to check if it should resume
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, {
                        action: 'checkKeywordSearchResume',
                        searchState: searchState
                    }).catch(error => {
                        console.log('Content script not ready yet, that\'s normal');
                    });
                }, 1000);
            }
        }
    }

    handleActionClick(tab) {
        // Fallback for browsers that don't support popups
        if (tab.url && (tab.url.includes('threads.net') || tab.url.includes('threads.com'))) {
            // Send message to content script to show inline controls
            chrome.tabs.sendMessage(tab.id, {
                action: 'showInlineControls'
            });
        } else {
            // Open Threads.com (official domain)
            chrome.tabs.create({
                url: 'https://www.threads.com'
            });
        }
    }

    async getSettings() {
        return await chrome.storage.sync.get();
    }

    async saveSettings(settings) {
        await chrome.storage.sync.set(settings);
    }

    async exportStats() {
        const stats = await chrome.storage.local.get(['stats']);
        return stats.stats || {};
    }

    setupPeriodicTasks() {
        // Clean up old data every hour
        setInterval(async () => {
            await this.cleanupOldData();
        }, 60 * 60 * 1000); // 1 hour

        // Check for rate limits every 15 minutes
        setInterval(async () => {
            await this.checkRateLimits();
        }, 15 * 60 * 1000); // 15 minutes
    }

    async cleanupOldData() {
        try {
            const result = await chrome.storage.local.get(['lastUpdate']);
            const lastUpdate = result.lastUpdate || 0;
            const now = Date.now();
            
            // Clear stats older than 24 hours
            if (now - lastUpdate > 24 * 60 * 60 * 1000) {
                await chrome.storage.local.remove(['stats']);
                console.log('Cleaned up old stats data');
            }
        } catch (error) {
            console.error('Error cleaning up data:', error);
        }
    }

    async checkRateLimits() {
        try {
            const settings = await chrome.storage.sync.get(['actionsPerHour', 'respectLimits']);
            
            if (!settings.respectLimits) return;
            
            const stats = await chrome.storage.local.get(['stats']);
            if (!stats.stats) return;
            
            const actionsPerHour = settings.actionsPerHour || 15;
            const currentActions = (stats.stats.comments || 0) + (stats.stats.likes || 0);
            
            if (currentActions >= actionsPerHour) {
                // Send warning to active Threads tabs
                const tabs = await chrome.tabs.query({
                    url: ['https://www.threads.net/*', 'https://threads.net/*', 'https://www.threads.com/*', 'https://threads.com/*']
                });
                
                for (const tab of tabs) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'rateLimitWarning',
                        currentActions,
                        limit: actionsPerHour
                    });
                }
            }
        } catch (error) {
            console.error('Error checking rate limits:', error);
        }
    }

    // Context menu support
    createContextMenus() {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'threadsai-comment',
                title: 'Комментировать с ThreadsAI',
                contexts: ['selection'],
                documentUrlPatterns: ['https://www.threads.net/*', 'https://threads.net/*', 'https://www.threads.com/*', 'https://threads.com/*']
            });
            
            chrome.contextMenus.create({
                id: 'threadsai-like',
                title: 'Лайкнуть с ThreadsAI',
                contexts: ['page'],
                documentUrlPatterns: ['https://www.threads.net/*', 'https://threads.net/*', 'https://www.threads.com/*', 'https://threads.com/*']
            });
            
            chrome.contextMenus.create({
                id: 'threadsai-settings',
                title: 'Настройки ThreadsAI',
                contexts: ['page']
            });
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    async handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case 'threadsai-comment':
                chrome.tabs.sendMessage(tab.id, {
                    action: 'quickComment',
                    selectedText: info.selectionText
                });
                break;
                
            case 'threadsai-like':
                chrome.tabs.sendMessage(tab.id, {
                    action: 'quickLike'
                });
                break;
                
            case 'threadsai-settings':
                chrome.tabs.create({
                    url: chrome.runtime.getURL('settings.html')
                });
                break;
        }
    }

    // Alarm support for scheduled actions
    setupAlarms() {
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });
    }

    async handleAlarm(alarm) {
        switch (alarm.name) {
            case 'dailyReset':
                await this.resetDailyStats();
                break;
                
            case 'cleanupCheck':
                await this.cleanupOldData();
                break;
        }
    }

    async resetDailyStats() {
        // Reset daily statistics
        await chrome.storage.local.set({
            dailyStats: {
                comments: 0,
                likes: 0,
                date: new Date().toDateString()
            }
        });
        
        console.log('Daily stats reset');
    }

    // Keyword search state management methods
    async getKeywordSearchState() {
        try {
            const result = await chrome.storage.local.get(['keywordSearchState']);
            return result.keywordSearchState || null;
        } catch (error) {
            console.error('Error getting keyword search state:', error);
            return null;
        }
    }

    async saveKeywordSearchState(state) {
        try {
            await chrome.storage.local.set({ keywordSearchState: state });
            console.log('💾 Background: Saved keyword search state');
        } catch (error) {
            console.error('Error saving keyword search state:', error);
        }
    }

    async clearKeywordSearchState() {
        try {
            await chrome.storage.local.remove(['keywordSearchState']);
            console.log('🗑️ Background: Cleared keyword search state');
        } catch (error) {
            console.error('Error clearing keyword search state:', error);
        }
    }

    async openSettings(sender) {
        try {
            // Chrome doesn't allow programmatically opening popup from content script
            // We'll show a clear notification with instructions
            if (chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'ico/icon-48.png',
                    title: 'ThreadsAI Настройки',
                    message: 'Нажмите на иконку расширения ThreadsAI в панели браузера для открытия настроек.'
                });
            }
            
            // Send success message back to content script
            console.log('Settings notification shown successfully');
        } catch (error) {
            console.error('Error opening settings:', error);
            // Don't throw error, just log it
        }
    }

    async openFullSettings() {
        try {
            // Open settings.html in a new tab
            const settingsUrl = chrome.runtime.getURL('settings.html');
            await chrome.tabs.create({
                url: settingsUrl,
                active: true
            });
            
            console.log('Full settings page opened successfully');
        } catch (error) {
            console.error('Error opening full settings:', error);
            throw error;
        }
    }
}

// Initialize background script
new ThreadsAIBackground();