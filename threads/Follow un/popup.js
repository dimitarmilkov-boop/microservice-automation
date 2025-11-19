// Threads Auto Follow Popup Script
class PopupController {
  constructor() {
    this.isRunning = false;
    this.subscribedCount = 0;
    this.targetCount = 50;
    this.avatarFilter = 'all'; // Фильтр по аватарке
    this.nameFilter = 'all'; // Фильтр по имени
    this.nameLanguage = 'all'; // Язык имени
    this.onlineFilter = 'all'; // Фильтр по онлайн статусу
    this.whitelistKeywords = ''; // Белый список ключевых слов
    this.blacklistKeywords = ''; // Черный список ключевых слов
    this.minDelay = 2; // Минимальная задержка
    this.maxDelay = 8; // Максимальная задержка
    this.theme = 'dark'; // Тема по умолчанию
    this.userList = ''; // Список пользователей для подписки
    this.ignoreList = ''; // Игнор-список пользователей
    this.enableFollowerParsing = false; // Включен ли автопарсинг
    this.startMode = 'follow'; // follow | unfollow
    this.progressPollingInterval = null; // Интервал для проверки прогресса

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSettings();
    this.updateStatus();
    this.checkCurrentTab();
    
    // Устанавливаем значения по умолчанию в поля ввода
    document.getElementById('min-delay-input').value = this.minDelay;
    document.getElementById('max-delay-input').value = this.maxDelay;
    document.getElementById('max-subscriptions-input').value = this.targetCount;
    
    // Обновляем плавающую кнопку при инициализации
    this.updateFloatingButton();
    
    // Инициализируем состояние коллапсируемых секций
    this.initializeCollapsibleSections();
  }

  bindEvents() {
    const startBtn = document.getElementById('start-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const scanDomBtn = document.getElementById('scan-dom-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const maxSubscriptionsInput = document.getElementById('max-subscriptions-input');
    const avatarFilterInputs = document.querySelectorAll('input[name="avatar-filter"]');
    const nameFilterInputs = document.querySelectorAll('input[name="name-filter"]');
    const nameLanguageInputs = document.querySelectorAll('input[name="name-language"]');
    const onlineFilterInputs = document.querySelectorAll('input[name="online-filter"]');
    const whitelistKeywordsInput = document.getElementById('whitelist-keywords');
    const blacklistKeywordsInput = document.getElementById('blacklist-keywords');
    const minDelayInput = document.getElementById('min-delay-input');
    const maxDelayInput = document.getElementById('max-delay-input');
    const userListInput = document.getElementById('user-list');
    const enableFollowerParsingToggle = document.getElementById('enable-follower-parsing');
    const autoParseBtn = document.getElementById('auto-parse-btn');
    const runModeFollowBtn = document.getElementById('run-mode-follow');
    const runModeUnfollowBtn = document.getElementById('run-mode-unfollow');
    
    startBtn.addEventListener('click', () => {
      if (this.isRunning) {
        this.showNotification('Останавливаю...', 'info');
        this.stopByMode();
      } else {
        this.showNotification(this.startMode === 'unfollow' ? 'Запускаю отписку' : 'Запускаю подписку', 'info');
        this.startByMode();
      }
    });
    const broadcastSettings = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.sendMessage(tab.id, {
          action: 'settingsChanged',
          minDelay: this.minDelay,
          maxDelay: this.maxDelay,
          targetCount: this.targetCount,
          startMode: this.startMode,
        });
      } catch (e) {}
    };

    if (runModeFollowBtn && runModeUnfollowBtn) {
      runModeFollowBtn.addEventListener('click', async () => {
        this.startMode = 'follow';
        runModeFollowBtn.classList.add('active');
        runModeUnfollowBtn.classList.remove('active');
        this.saveSettings();
        this.updateUI();
        await broadcastSettings();
      });
      runModeUnfollowBtn.addEventListener('click', async () => {
        this.startMode = 'unfollow';
        runModeUnfollowBtn.classList.add('active');
        runModeFollowBtn.classList.remove('active');
        this.saveSettings();
        this.updateUI();
        await broadcastSettings();
      });
    }
    // stop button removed; toggled via start button
    viewHistoryBtn.addEventListener('click', () => this.showHistory());
    scanDomBtn.addEventListener('click', () => this.scanDOM());
    themeToggle.addEventListener('click', () => this.toggleTheme());

    minDelayInput.addEventListener('change', async (e) => {
      this.minDelay = parseInt(e.target.value) || 2;
      if (this.minDelay >= this.maxDelay) {
        this.maxDelay = this.minDelay + 1;
        maxDelayInput.value = this.maxDelay;
      }
      this.saveSettings();
      await broadcastSettings();
    });

    maxDelayInput.addEventListener('change', async (e) => {
      this.maxDelay = parseInt(e.target.value) || 8;
      if (this.maxDelay <= this.minDelay) {
        this.minDelay = this.maxDelay - 1;
        minDelayInput.value = this.minDelay;
      }
      this.saveSettings();
      await broadcastSettings();
    });

    maxSubscriptionsInput.addEventListener('change', async (e) => {
      this.targetCount = parseInt(e.target.value) || 50;
      this.updateUI();
      this.saveSettings();
      
      // Отправляем обновление в content script для обновления плавающей кнопки
      this.updateFloatingButton();
      await broadcastSettings();
    });

    avatarFilterInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        console.log(`Threads Auto Follow Popup: [DEBUG] Изменен фильтр аватарки: ${e.target.value}`);
        this.avatarFilter = e.target.value;
        this.saveSettings();
      });
    });

    nameFilterInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        console.log(`Threads Auto Follow Popup: [DEBUG] Изменен фильтр имени: ${e.target.value}`);
        this.nameFilter = e.target.value;
        this.saveSettings();
      });
    });

    nameLanguageInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        console.log(`Threads Auto Follow Popup: [DEBUG] Изменен язык имени: ${e.target.value}`);
        this.nameLanguage = e.target.value;
        this.saveSettings();
      });
    });

    onlineFilterInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        console.log(`Threads Auto Follow Popup: [DEBUG] Изменен фильтр онлайн статуса: ${e.target.value}`);
        this.onlineFilter = e.target.value;
        this.saveSettings();
      });
    });

    whitelistKeywordsInput.addEventListener('input', (e) => {
      this.whitelistKeywords = e.target.value;
      this.saveSettings();
    });

    blacklistKeywordsInput.addEventListener('input', (e) => {
      this.blacklistKeywords = e.target.value;
      this.saveSettings();
    });

    userListInput.addEventListener('input', (e) => {
      this.userList = e.target.value;
      this.saveSettings();
    });

    const ignoreListInput = document.getElementById('ignore-list');
    ignoreListInput.addEventListener('input', (e) => {
      this.ignoreList = e.target.value;
      this.saveSettings();
    });

    enableFollowerParsingToggle.addEventListener('change', (e) => {
      this.enableFollowerParsing = e.target.checked;
      this.saveSettings();
    });

    autoParseBtn.addEventListener('click', () => {
      this.startParsing();
    });

    // Обновляем статус каждую секунду
    setInterval(() => this.updateStatus(), 1000);
  }

  async checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('threads.net') && !tab.url.includes('threads.com')) {
        this.showError('Откройте страницу Threads для использования расширения');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка проверки вкладки:', error);
      return false;
    }
  }

  async startFollowing() {
    const isValidTab = await this.checkCurrentTab();
    if (!isValidTab) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Сначала обновляем кнопки
      await chrome.tabs.sendMessage(tab.id, {
        action: 'refreshButtons'
      });
      
      // Ждем немного
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Отправляем сообщение content script
      console.log(`Threads Auto Follow Popup: [DEBUG] Отправляем сообщение startFollow:`, {
        action: 'startFollow',
        targetCount: this.targetCount,
        avatarFilter: this.avatarFilter,
        nameFilter: this.nameFilter,
        nameLanguage: this.nameLanguage,
        onlineFilter: this.onlineFilter,
        whitelistKeywords: this.whitelistKeywords,
        blacklistKeywords: this.blacklistKeywords,
        minDelay: this.minDelay * 1000,
        maxDelay: this.maxDelay * 1000,
        userList: this.getUserList(),
        ignoreList: this.ignoreList
      });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'startFollow',
        targetCount: this.targetCount,
        avatarFilter: this.avatarFilter,
        nameFilter: this.nameFilter,
        nameLanguage: this.nameLanguage,
        onlineFilter: this.onlineFilter,
        whitelistKeywords: this.whitelistKeywords,
        blacklistKeywords: this.blacklistKeywords,
        minDelay: this.minDelay * 1000,
        maxDelay: this.maxDelay * 1000,
        userList: this.getUserList(),
        ignoreList: this.ignoreList
      });

      if (response && response.status === 'started') {
        this.isRunning = true;
        this.updateUI();
        this.showSuccess('Подписка запущена!');
      } else {
        this.showError('Не удалось запустить подписку');
      }
    } catch (error) {
      console.error('Ошибка запуска подписки:', error);
      this.showError('Ошибка запуска подписки. Убедитесь, что вы на странице Threads и модальное окно подписчиков открыто');
    }
  }

  async stopFollowing() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'stopFollow'
      });

      if (response && response.status === 'stopped') {
        this.isRunning = false;
        this.updateUI();
        this.showSuccess('Подписка остановлена');
      }
    } catch (error) {
      console.error('Ошибка остановки подписки:', error);
    }
  }

  async showHistory() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.includes('threads.net') || tab.url.includes('threads.com')) {
        // Отправляем сообщение в content script для показа модального окна
        await chrome.tabs.sendMessage(tab.id, {
          action: 'showHistoryModal'
        });
        
        this.showSuccess('История подписок открыта');
      } else {
        this.showError('Откройте страницу Threads для использования расширения');
      }
    } catch (error) {
      console.error('Ошибка открытия истории:', error);
      this.showError('Ошибка открытия истории');
    }
  }

  async scanDOM() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.includes('threads.net') || tab.url.includes('threads.com')) {
        // Отправляем сообщение в content script для сканирования DOM
        await chrome.tabs.sendMessage(tab.id, {
          action: 'scanDOM'
        });
        
        this.showSuccess('Сканирование DOM запущено. Проверьте консоль браузера (F12)');
      } else {
        this.showError('Откройте страницу Threads для использования расширения');
      }
    } catch (error) {
      console.error('Ошибка сканирования DOM:', error);
      this.showError('Ошибка сканирования DOM');
    }
  }


  async updateStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.includes('threads.net') || tab.url.includes('threads.com')) {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'getStatus'
        });

        if (response) {
          this.isRunning = !!(response.isRunning || response.isUnfollowing);
          // В режиме отписки показываем счетчик отписок
          if (response.isUnfollowing) {
            this.subscribedCount = response.unfollowedCount || 0;
          } else {
            this.subscribedCount = response.subscribedCount || 0;
          }
          // Обновляем локальный лимит отображения, если пришел с контент-скрипта
          if (response.targetCount) {
            this.targetCount = response.targetCount;
          }
          this.updateUI();
        }
      }
    } catch (error) {
      // Игнорируем ошибки при обновлении статуса
    }
  }

  updateUI() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const subscribedCount = document.getElementById('subscribed-count');
    const targetCount = document.getElementById('target-count');
    const progressFill = document.getElementById('progress-fill');
    const startBtn = document.getElementById('start-btn');
    // stop button removed
    const runModeFollowBtn = document.getElementById('run-mode-follow');
    const runModeUnfollowBtn = document.getElementById('run-mode-unfollow');

    // Обновляем статус
    if (this.isRunning) {
      statusIndicator.className = 'status-indicator status-running';
      statusText.textContent = 'Выполняется';
      startBtn.disabled = false;
    } else {
      statusIndicator.className = 'status-indicator status-stopped';
      statusText.textContent = 'Остановлено';
      startBtn.disabled = false;
    }

    // Отрисовываем активное состояние сегмента переключателя
    if (runModeFollowBtn && runModeUnfollowBtn) {
      if (this.startMode === 'unfollow') {
        runModeUnfollowBtn.classList.add('active');
        runModeFollowBtn.classList.remove('active');
      } else {
        runModeFollowBtn.classList.add('active');
        runModeUnfollowBtn.classList.remove('active');
      }
    }

    // Обновляем счетчики
    subscribedCount.textContent = this.subscribedCount;
    targetCount.textContent = this.targetCount;

    // Обновляем прогресс бар
    const progress = this.targetCount > 0 ? (this.subscribedCount / this.targetCount) * 100 : 0;
    progressFill.style.width = `${Math.min(progress, 100)}%`;

    // Обновляем текст кнопок
    if (this.isRunning) {
      startBtn.textContent = '⏹️ Остановить';
    } else {
      startBtn.textContent = this.startMode === 'unfollow' ? '▶️ Начать отписку' : '▶️ Начать подписку';
    }
  }

  loadSettings() {
    chrome.storage.local.get(['targetCount', 'avatarFilter', 'nameFilter', 'nameLanguage', 'onlineFilter', 'whitelistKeywords', 'blacklistKeywords', 'minDelay', 'maxDelay', 'theme', 'userList', 'ignoreList', 'startMode'], (result) => {
      console.log(`Threads Auto Follow Popup: [DEBUG] Загружаем настройки из storage:`, result);
      
      if (result.targetCount) {
        this.targetCount = result.targetCount;
        document.getElementById('max-subscriptions-input').value = this.targetCount;
      } else {
        // Устанавливаем значение по умолчанию
        document.getElementById('max-subscriptions-input').value = this.targetCount;
      }

      // Загружаем режим запуска
      if (result.startMode === 'unfollow' || result.startMode === 'follow') {
        this.startMode = result.startMode;
      } else {
        this.startMode = 'follow';
      }
      if (result.avatarFilter) {
        this.avatarFilter = result.avatarFilter;
        console.log(`Threads Auto Follow Popup: [DEBUG] Загружен фильтр аватарки из storage: ${this.avatarFilter}`);
        
        // Убеждаемся, что все радио-кнопки сброшены
        const allFilterInputs = document.querySelectorAll('input[name="avatar-filter"]');
        allFilterInputs.forEach(input => {
          input.checked = false;
        });
        
        // Устанавливаем правильную кнопку
        const filterInput = document.querySelector(`input[name="avatar-filter"][value="${this.avatarFilter}"]`);
        if (filterInput) {
          filterInput.checked = true;
          console.log(`Threads Auto Follow Popup: [DEBUG] Установлен фильтр в UI: ${this.avatarFilter}`);
        } else {
          console.log(`Threads Auto Follow Popup: [DEBUG] Не найден input для фильтра: ${this.avatarFilter}`);
          // Если не найден, устанавливаем по умолчанию
          const defaultFilter = document.querySelector('input[name="avatar-filter"][value="all"]');
          if (defaultFilter) {
            defaultFilter.checked = true;
            this.avatarFilter = 'all';
          }
        }
      } else {
        // Устанавливаем значение по умолчанию
        console.log(`Threads Auto Follow Popup: [DEBUG] Устанавливаем фильтр по умолчанию: all`);
        this.avatarFilter = 'all';
        const defaultFilter = document.querySelector('input[name="avatar-filter"][value="all"]');
        if (defaultFilter) {
          defaultFilter.checked = true;
        }
      }
      
      console.log(`Threads Auto Follow Popup: [DEBUG] Финальный avatarFilter: ${this.avatarFilter}`);

      // Загружаем настройки фильтрации имен
      if (result.nameFilter) {
        this.nameFilter = result.nameFilter;
        const nameFilterInput = document.querySelector(`input[name="name-filter"][value="${this.nameFilter}"]`);
        if (nameFilterInput) {
          nameFilterInput.checked = true;
        }
      } else {
        // Устанавливаем значение по умолчанию
        const defaultNameFilter = document.querySelector('input[name="name-filter"][value="all"]');
        if (defaultNameFilter) {
          defaultNameFilter.checked = true;
        }
      }

      // Загружаем настройки языка имени
      if (result.nameLanguage) {
        this.nameLanguage = result.nameLanguage;
        const nameLanguageInput = document.querySelector(`input[name="name-language"][value="${this.nameLanguage}"]`);
        if (nameLanguageInput) {
          nameLanguageInput.checked = true;
        }
      } else {
        // Устанавливаем значение по умолчанию
        const defaultNameLanguage = document.querySelector('input[name="name-language"][value="all"]');
        if (defaultNameLanguage) {
          defaultNameLanguage.checked = true;
        }
      }

      // Загружаем настройки фильтра онлайн статуса
      if (result.onlineFilter) {
        this.onlineFilter = result.onlineFilter;
        const onlineFilterInput = document.querySelector(`input[name="online-filter"][value="${this.onlineFilter}"]`);
        if (onlineFilterInput) {
          onlineFilterInput.checked = true;
        }
      } else {
        // Устанавливаем значение по умолчанию
        const defaultOnlineFilter = document.querySelector('input[name="online-filter"][value="all"]');
        if (defaultOnlineFilter) {
          defaultOnlineFilter.checked = true;
        }
      }

      // Загружаем белый список ключевых слов
      if (result.whitelistKeywords) {
        this.whitelistKeywords = result.whitelistKeywords;
        document.getElementById('whitelist-keywords').value = this.whitelistKeywords;
      } else {
        document.getElementById('whitelist-keywords').value = this.whitelistKeywords;
      }

      // Загружаем черный список ключевых слов
      if (result.blacklistKeywords) {
        this.blacklistKeywords = result.blacklistKeywords;
        document.getElementById('blacklist-keywords').value = this.blacklistKeywords;
      } else {
        document.getElementById('blacklist-keywords').value = this.blacklistKeywords;
      }

      // Загружаем настройки задержки
      if (result.minDelay) {
        this.minDelay = result.minDelay;
        document.getElementById('min-delay-input').value = this.minDelay;
      } else {
        // Устанавливаем значение по умолчанию
        document.getElementById('min-delay-input').value = this.minDelay;
      }

      if (result.maxDelay) {
        this.maxDelay = result.maxDelay;
        document.getElementById('max-delay-input').value = this.maxDelay;
      } else {
        // Устанавливаем значение по умолчанию
        document.getElementById('max-delay-input').value = this.maxDelay;
      }
      
      // Загружаем тему
      if (result.theme) {
        this.theme = result.theme;
      }
      this.applyTheme();
      
      // Загружаем список пользователей
      if (result.userList) {
        this.userList = result.userList;
        document.getElementById('user-list').value = this.userList;
      }
      
      // Загружаем игнор-список
      if (result.ignoreList) {
        this.ignoreList = result.ignoreList;
        document.getElementById('ignore-list').value = this.ignoreList;
      }

        // Загружаем настройки парсинга
        if (result.enableFollowerParsing !== undefined) {
          this.enableFollowerParsing = result.enableFollowerParsing;
          document.getElementById('enable-follower-parsing').checked = this.enableFollowerParsing;
        }

        // Обновляем счетчик пользователей
        this.updateUserListCount();
        
        // Добавляем обработчик изменения списка пользователей
        this.updateUserListOnChange();
        
    // Проверяем, есть ли сохраненные данные парсинга
    this.checkSavedParsingData();
    
    // Проверяем, идет ли парсинг в фоне
    this.checkOngoingParsing();
      
      // Обновляем UI после загрузки настроек
      this.updateUI();
      
      // Обновляем плавающую кнопку после загрузки настроек
      this.updateFloatingButton();
    });
  }

  saveSettings() {
    chrome.storage.local.set({
      targetCount: this.targetCount,
      avatarFilter: this.avatarFilter,
      nameFilter: this.nameFilter,
      nameLanguage: this.nameLanguage,
      onlineFilter: this.onlineFilter,
      whitelistKeywords: this.whitelistKeywords,
      blacklistKeywords: this.blacklistKeywords,
      minDelay: this.minDelay,
      maxDelay: this.maxDelay,
      theme: this.theme,
        userList: this.userList,
        ignoreList: this.ignoreList,
        enableFollowerParsing: this.enableFollowerParsing,
        startMode: this.startMode
    });
  }

  async updateFloatingButton() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.includes('threads.net') || tab.url.includes('threads.com')) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'updateTargetCount',
          targetCount: this.targetCount
        });
      }
    } catch (error) {
      // Игнорируем ошибки
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      z-index: 1000;
      background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#ffffff' : '#1a1a1a'};
      color: ${type === 'success' ? '#000000' : '#ffffff'};
      padding: 10px 15px;
      border-radius: 6px;
      font-size: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      border: 1px solid #333333;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // Переключение темы
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.saveSettings();
    this.updateFloatingButton();
  }

  // Применение темы
  applyTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    
    if (this.theme === 'light') {
      body.classList.add('light-theme');
      themeIcon.textContent = '☀️';
    } else {
      body.classList.remove('light-theme');
      themeIcon.textContent = '🌙';
    }
  }

  // Получение списка игнорируемых пользователей из текстового поля
  getIgnoreList() {
    return this.ignoreList.split('\n')
      .map(username => username.trim())
      .filter(username => username.length > 0);
  }

  // Добавление пользователя в игнор-список
  addToIgnoreList(username) {
    const currentIgnoreList = this.getIgnoreList();
    if (!currentIgnoreList.includes(username)) {
      const updatedIgnoreList = [...currentIgnoreList, username].join('\n');
      this.ignoreList = updatedIgnoreList;
      document.getElementById('ignore-list').value = updatedIgnoreList;
      this.saveSettings();
      console.log(`Threads Auto Follow Popup: [DEBUG] Добавлен в игнор-список: ${username}`);
    }
  }

  // Удаление пользователя из игнор-списка
  removeFromIgnoreList(username) {
    const currentIgnoreList = this.getIgnoreList();
    const index = currentIgnoreList.indexOf(username);
    if (index > -1) {
      currentIgnoreList.splice(index, 1);
      const updatedIgnoreList = currentIgnoreList.join('\n');
      this.ignoreList = updatedIgnoreList;
      document.getElementById('ignore-list').value = updatedIgnoreList;
      this.saveSettings();
      console.log(`Threads Auto Follow Popup: [DEBUG] Удален из игнор-списка: ${username}`);
    }
  }

  // Получение списка пользователей из текстового поля
  getUserList() {
    return this.userList.split('\n')
      .map(username => username.trim())
      .filter(username => username.length > 0);
  }


  // Запуск парсинга подписчиков
  async startParsing() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Показываем прогресс парсинга
      this.showParsingProgress();
      
      // Проверяем, что мы на правильной странице
      console.log('Threads Auto Follow Popup: [DEBUG] Текущий URL:', tab.url);
      if (!tab.url.includes('threads.net') && !tab.url.includes('threads.com')) {
        this.hideParsingProgress();
        this.showNotification('Откройте страницу Threads для парсинга', 'error');
        return;
      }
      
      console.log('Threads Auto Follow Popup: [DEBUG] URL проверен, отправляем сообщение...');
      
      // Сначала проверяем, готов ли content script
      try {
        const pingResponse = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
        console.log('Threads Auto Follow Popup: [DEBUG] Content script готов:', pingResponse);
      } catch (pingError) {
        console.log('Threads Auto Follow Popup: [DEBUG] Content script не отвечает, попробуем перезагрузить...');
        // Пытаемся перезагрузить content script
        try {
          await chrome.tabs.executeScript(tab.id, {
            code: 'console.log("Threads Auto Follow: Content script ping");'
          });
        } catch (reloadError) {
          console.log('Threads Auto Follow Popup: [DEBUG] Не удалось перезагрузить content script:', reloadError.message);
        }
      }
      
      // Пытаемся отправить сообщение с повторными попытками
      let response = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !response) {
        try {
          console.log(`Threads Auto Follow Popup: [DEBUG] Попытка ${attempts + 1} отправки сообщения...`);
          response = await chrome.tabs.sendMessage(tab.id, {
            action: 'startParsing',
            enableFollowerParsing: this.enableFollowerParsing
          });
          console.log('Threads Auto Follow Popup: [DEBUG] Получен ответ:', response);
          break;
        } catch (sendError) {
          attempts++;
          console.log(`Threads Auto Follow Popup: [DEBUG] Попытка ${attempts}/${maxAttempts} не удалась:`, sendError.message);
          
          if (attempts < maxAttempts) {
            // Ждем немного перед следующей попыткой
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Пытаемся перезагрузить content script
            try {
              await chrome.tabs.executeScript(tab.id, {
                code: 'console.log("Threads Auto Follow: Content script reloaded");'
              });
            } catch (reloadError) {
              console.log('Threads Auto Follow Popup: [DEBUG] Не удалось перезагрузить content script:', reloadError.message);
            }
          }
        }
      }

      if (response && response.status === 'started') {
        this.showNotification('Парсинг запущен!', 'info');
      } else if (response && response.status === 'no_modal') {
        this.hideParsingProgress();
        this.showNotification('Откройте список подписчиков для парсинга', 'error');
      } else {
        this.hideParsingProgress();
        this.showNotification('Ошибка запуска парсинга. Обновите страницу и попробуйте снова.', 'error');
      }
    } catch (error) {
      console.error('Ошибка при запуске парсинга:', error);
      this.hideParsingProgress();
      this.showNotification('Ошибка запуска парсинга. Обновите страницу и попробуйте снова.', 'error');
    }
  }

  // Запуск массовой отписки через content script
  async startUnfollow() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.showParsingProgress();

      // Проверка домена (threads.net/com)
      console.log('Threads Auto Follow Popup: [DEBUG] Текущий URL:', tab.url);
      if (!tab.url.includes('threads.net') && !tab.url.includes('threads.com')) {
        this.hideParsingProgress();
        this.showNotification('Откройте страницу Threads', 'error');
        return;
      }

      // Ping
      try { await chrome.tabs.sendMessage(tab.id, { action: 'ping' }); } catch {}

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'startUnfollow',
        targetCount: this.targetCount,
        minDelay: this.minDelay * 1000,
        maxDelay: this.maxDelay * 1000
      });
      if (response && response.status === 'started') {
        this.isRunning = true;
        this.updateUI();
        this.showNotification('Отписка запущена', 'info');
      } else {
        this.hideParsingProgress();
        this.showNotification('Не удалось запустить отписку', 'error');
      }
    } catch (e) {
      console.error('Ошибка запуска отписки', e);
      this.hideParsingProgress();
      this.showNotification('Ошибка запуска отписки', 'error');
    }
  }

  async stopUnfollow() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'stopUnfollow' });
      this.isRunning = false;
      this.updateUI();
      this.showNotification('Отписка остановлена', 'info');
    } catch (e) {
      console.error('Ошибка остановки отписки', e);
      this.showNotification('Не удалось остановить отписку', 'error');
    }
  }
  // Остановить по выбранному типу
  stopByMode() {
    if (this.startMode === 'unfollow') {
      this.stopUnfollow();
    } else {
      this.stopFollowing();
    }
  }

  // Унифицированный запуск по выбранному типу
  startByMode() {
    if (this.startMode === 'unfollow') {
      this.startUnfollow();
    } else {
      this.startFollowing();
    }
  }

    // Обработка завершения парсинга
    handleParsingCompleted(parsedUsernames, count) {
      console.log(`Threads Auto Follow Popup: [DEBUG] Парсинг завершен. Найдено ${count} пользователей`);
      console.log(`Threads Auto Follow Popup: [DEBUG] Список найденных пользователей:`, parsedUsernames);
      
      // Останавливаем периодическую проверку
      this.stopProgressPolling();
      
      // Обновляем финальный прогресс
      this.updateParsingProgress(count, 200, 'Парсинг завершен!');
      
      // Скрываем прогресс парсинга через 3 секунды
      setTimeout(() => {
        this.hideParsingProgress();
      }, 3000);
      
      // Добавляем найденных пользователей в список пользователей
      const existingUsers = this.getUserList();
      console.log(`Threads Auto Follow Popup: [DEBUG] Существующие пользователи:`, existingUsers);
      
      const newUsers = parsedUsernames.filter(username => !existingUsers.includes(username));
      console.log(`Threads Auto Follow Popup: [DEBUG] Новые пользователи для добавления:`, newUsers);
      
      if (newUsers.length > 0) {
        const updatedUserList = [...existingUsers, ...newUsers].join('\n');
        this.userList = updatedUserList;
        document.getElementById('user-list').value = updatedUserList;
        this.saveSettings();
        
        console.log(`Threads Auto Follow Popup: [DEBUG] Обновленный список пользователей:`, updatedUserList);
        this.showNotification(`Добавлено ${newUsers.length} новых пользователей в список!`, 'success');
      } else {
        this.showNotification('Все найденные пользователи уже есть в списке', 'info');
      }
      
      // Обновляем счетчик пользователей
      this.updateUserListCount();
    }

  // Показать прогресс парсинга
  showParsingProgress() {
    const statusElement = document.getElementById('parsing-status');
    const statusText = document.getElementById('parsing-status-text');
    const progressFill = document.getElementById('parsing-progress-fill');
    const stats = document.getElementById('parsing-stats');
    
    if (statusElement) {
      statusElement.style.display = 'block';
      statusText.textContent = 'Парсинг подписчиков...';
      progressFill.style.width = '0%';
      stats.textContent = 'Найдено: 0 пользователей';
    }
  }

  // Скрыть прогресс парсинга
  hideParsingProgress() {
    const statusElement = document.getElementById('parsing-status');
    if (statusElement) {
      statusElement.style.display = 'none';
    }
  }

    // Обновить прогресс парсинга
    updateParsingProgress(current, total, status = 'Парсинг...') {
      const statusText = document.getElementById('parsing-status-text');
      const progressFill = document.getElementById('parsing-progress-fill');
      const stats = document.getElementById('parsing-stats');
      
      if (statusText) statusText.textContent = status;
      if (stats) stats.textContent = `Найдено: ${current} пользователей`;
      
      if (progressFill && total > 0) {
        const percentage = Math.min((current / total) * 100, 100);
        progressFill.style.width = `${percentage}%`;
        
        // Обновляем цвет прогресс-бара в зависимости от прогресса
        if (percentage < 30) {
          progressFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
        } else if (percentage < 70) {
          progressFill.style.background = 'linear-gradient(90deg, #ffa726, #ffb74d)';
        } else {
          progressFill.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
        }
      }
    }

  // Обновить счетчик пользователей в списке
  updateUserListCount() {
    const userListTextarea = document.getElementById('user-list');
    const userListSection = document.querySelector('.user-list-section .section-header h3');
    
    if (userListTextarea && userListSection) {
      const userCount = userListTextarea.value.split('\n').filter(username => username.trim()).length;
      userListSection.textContent = `👥 Управление пользователями (${userCount})`;
    }
  }

  // Обновить счетчик при изменении списка пользователей
  updateUserListOnChange() {
    const userListTextarea = document.getElementById('user-list');
    if (userListTextarea) {
      userListTextarea.addEventListener('input', () => {
        this.updateUserListCount();
      });
    }
  }

  // Инициализация коллапсируемых секций
  initializeCollapsibleSections() {
    // Загружаем состояние секций из localStorage
    const sections = ['filters-section', 'parsing-section', 'user-management-section', 'keyword-filters-section'];
    
    sections.forEach(sectionId => {
      // По умолчанию все секции свернуты
      const savedState = localStorage.getItem(`section-${sectionId}-collapsed`);
      if (savedState !== 'false') { // Если не явно развернуто, то сворачиваем
        this.collapseSection(sectionId);
      }
    });

    // Добавляем обработчики событий для всех секций
    this.bindCollapsibleEvents();
  }

  // Привязка обработчиков событий для коллапсируемых секций
  bindCollapsibleEvents() {
    const sectionHeaders = document.querySelectorAll('.section-header[data-section]');
    
    sectionHeaders.forEach(header => {
      header.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = header.getAttribute('data-section');
        this.toggleSection(sectionId);
      });
    });
  }

  // Переключение состояния секции
  toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const button = document.getElementById(`${sectionId}-btn`);
    
    if (content.classList.contains('collapsed')) {
      this.expandSection(sectionId);
    } else {
      this.collapseSection(sectionId);
    }
  }

  // Свернуть секцию
  collapseSection(sectionId) {
    const content = document.getElementById(sectionId);
    const button = document.getElementById(`${sectionId}-btn`);
    
    if (content && button) {
      content.classList.remove('expanded');
      content.classList.add('collapsed');
      button.textContent = '▶';
      
      // Сохраняем состояние
      localStorage.setItem(`section-${sectionId}-collapsed`, 'true');
    }
  }

  // Развернуть секцию
  expandSection(sectionId) {
    const content = document.getElementById(sectionId);
    const button = document.getElementById(`${sectionId}-btn`);
    
    if (content && button) {
      content.classList.remove('collapsed');
      content.classList.add('expanded');
      button.textContent = '▼';
      
      // Сохраняем состояние
      localStorage.setItem(`section-${sectionId}-collapsed`, 'false');
    }
  }

    // Проверить сохраненные данные парсинга
    async checkSavedParsingData() {
      try {
        const result = await chrome.storage.local.get(['parsedUsernames', 'parsingCompleted', 'parsingTimestamp']);
        
        if (result.parsingCompleted && result.parsedUsernames && result.parsedUsernames.length > 0) {
          // Проверяем, не старые ли данные (старше 5 минут)
          const now = Date.now();
          const timestamp = result.parsingTimestamp || 0;
          const timeDiff = now - timestamp;
          
          if (timeDiff < 5 * 60 * 1000) { // 5 минут
            console.log(`Threads Auto Follow Popup: [DEBUG] Найдены сохраненные данные парсинга: ${result.parsedUsernames.length} пользователей`);
            console.log(`Threads Auto Follow Popup: [DEBUG] Сохраненные пользователи:`, result.parsedUsernames);
            
            // Добавляем найденных пользователей в список
            const existingUsers = this.getUserList();
            console.log(`Threads Auto Follow Popup: [DEBUG] Существующие пользователи:`, existingUsers);
            
            const newUsers = result.parsedUsernames.filter(username => !existingUsers.includes(username));
            console.log(`Threads Auto Follow Popup: [DEBUG] Новые пользователи для добавления:`, newUsers);
            
            if (newUsers.length > 0) {
              const updatedUserList = [...existingUsers, ...newUsers].join('\n');
              this.userList = updatedUserList;
              document.getElementById('user-list').value = updatedUserList;
              this.saveSettings();
              
              console.log(`Threads Auto Follow Popup: [DEBUG] Обновленный список пользователей:`, updatedUserList);
              this.showNotification(`Загружено ${newUsers.length} пользователей из сохраненного парсинга!`, 'success');
              this.updateUserListCount();
            } else {
              console.log(`Threads Auto Follow Popup: [DEBUG] Все пользователи уже есть в списке`);
            }
            
            // Очищаем сохраненные данные
            chrome.storage.local.remove(['parsedUsernames', 'parsingCompleted', 'parsingTimestamp']);
          } else {
            console.log(`Threads Auto Follow Popup: [DEBUG] Сохраненные данные парсинга устарели (${Math.round(timeDiff / 1000 / 60)} минут)`);
          }
        } else {
          console.log(`Threads Auto Follow Popup: [DEBUG] Нет сохраненных данных парсинга`);
        }
      } catch (error) {
        console.error('Ошибка при проверке сохраненных данных парсинга:', error);
      }
    }

    // Проверить, идет ли парсинг в фоне
    async checkOngoingParsing() {
      try {
        const result = await chrome.storage.local.get(['parsingInProgress', 'parsingProgress']);
        
        if (result.parsingInProgress && result.parsingProgress) {
          console.log('Threads Auto Follow Popup: [DEBUG] Обнаружен активный парсинг в фоне');
          
          // Показываем прогресс парсинга
          this.showParsingProgress();
          this.updateParsingProgress(
            result.parsingProgress.current,
            result.parsingProgress.total,
            result.parsingProgress.status
          );
          
          // Показываем уведомление
          this.showNotification('Парсинг продолжается в фоне...', 'info');
          
          // Запускаем периодическую проверку прогресса
          this.startProgressPolling();
        }
      } catch (error) {
        console.error('Ошибка при проверке активного парсинга:', error);
      }
    }

    // Запуск периодической проверки прогресса парсинга
    startProgressPolling() {
      if (this.progressPollingInterval) {
        clearInterval(this.progressPollingInterval);
      }
      
      this.progressPollingInterval = setInterval(async () => {
        try {
          const result = await chrome.storage.local.get(['parsingInProgress', 'parsingProgress']);
          
          if (result.parsingInProgress && result.parsingProgress) {
            // Обновляем прогресс
            this.updateParsingProgress(
              result.parsingProgress.current,
              result.parsingProgress.total,
              result.parsingProgress.status
            );
          } else {
            // Парсинг завершен, останавливаем проверку
            this.stopProgressPolling();
            this.hideParsingProgress();
          }
        } catch (error) {
          console.error('Ошибка при проверке прогресса парсинга:', error);
        }
      }, 2000); // Проверяем каждые 2 секунды
    }

    // Остановка периодической проверки прогресса
    stopProgressPolling() {
      if (this.progressPollingInterval) {
        clearInterval(this.progressPollingInterval);
        this.progressPollingInterval = null;
      }
    }

}

// Инициализируем контроллер при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.popupController = new PopupController();
});


// Слушаем сообщения от background script и content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'statusUpdate') {
    // Обновляем статус при получении сообщения
    const controller = window.popupController;
    if (controller) {
      controller.isRunning = request.data.isRunning;
      controller.subscribedCount = request.data.subscribedCount;
      controller.updateUI();
    }
  } else if (request.action === 'updateIgnoreList') {
    // Обновляем игнор-список при получении сообщения от content script
    const controller = window.popupController;
    if (controller) {
      controller.ignoreList = request.ignoreList;
      document.getElementById('ignore-list').value = request.ignoreList;
      controller.saveSettings();
    }
  } else if (request.action === 'updateUserList') {
    // Обновляем список пользователей при получении сообщения от content script
    const controller = window.popupController;
    if (controller) {
      controller.userList = request.userList.join('\n');
      document.getElementById('user-list').value = controller.userList;
      controller.updateUserListCount();
      controller.saveSettings();
    }
  } else if (request.action === 'historyUpdated') {
    // Обновляем историю при получении сообщения от content script
    const controller = window.popupController;
    if (controller) {
      // Обновляем счетчик подписок если есть
      if (request.history && request.history.length > 0) {
        controller.subscribedCount = request.history.length;
        controller.updateUI();
      }
    }
  } else if (request.action === 'parsingCompleted') {
    // Обрабатываем завершение парсинга
    const controller = window.popupController;
    if (controller) {
      controller.handleParsingCompleted(request.parsedUsernames, request.count);
    }
  } else if (request.action === 'parsingProgress') {
    // Обрабатываем прогресс парсинга
    const controller = window.popupController;
    if (controller) {
      controller.updateParsingProgress(request.current, request.total, request.status);
    }
  }
});

// Сохраняем ссылку на контроллер для доступа из обработчика сообщений
window.popupController = null;
