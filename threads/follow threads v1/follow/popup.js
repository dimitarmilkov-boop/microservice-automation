// Threads Auto Follow Popup Script
class PopupController {
  constructor() {
    this.isRunning = false;
    this.subscribedCount = 0;
    this.targetCount = 50;
    this.delay = 2;

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSettings();
    this.updateStatus();
    this.checkCurrentTab();
    
    // Устанавливаем значения по умолчанию в поля ввода
    document.getElementById('delay-input').value = this.delay;
    document.getElementById('max-subscriptions-input').value = this.targetCount;
    
    // Обновляем плавающую кнопку при инициализации
    this.updateFloatingButton();
  }

  bindEvents() {
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const delayInput = document.getElementById('delay-input');
    const maxSubscriptionsInput = document.getElementById('max-subscriptions-input');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    startBtn.addEventListener('click', () => this.startFollowing());
    stopBtn.addEventListener('click', () => this.stopFollowing());
    viewHistoryBtn.addEventListener('click', () => this.showHistory());
    closeHistoryBtn.addEventListener('click', () => this.hideHistory());
    clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    
    delayInput.addEventListener('change', (e) => {
      this.delay = parseInt(e.target.value) || 2;
      this.saveSettings();
    });

    maxSubscriptionsInput.addEventListener('change', (e) => {
      this.targetCount = parseInt(e.target.value) || 50;
      this.updateUI();
      this.saveSettings();
      
      // Отправляем обновление в content script для обновления плавающей кнопки
      this.updateFloatingButton();
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
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'startFollow',
        delay: this.delay * 1000,
        targetCount: this.targetCount
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

  showHistory() {
    const modal = document.getElementById('history-modal');
    modal.style.display = 'flex';
    this.loadHistory();
  }

  hideHistory() {
    const modal = document.getElementById('history-modal');
    modal.style.display = 'none';
  }

  async loadHistory() {
    try {
      const result = await chrome.storage.local.get(['subscriptionHistory']);
      const history = result.subscriptionHistory || [];
      
      const historyList = document.getElementById('history-list');
      
      if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">История подписок пуста</div>';
        return;
      }

      // Сортируем по дате (новые сверху)
      history.sort((a, b) => new Date(b.date) - new Date(a.date));

      historyList.innerHTML = history.map(item => `
        <div class="history-item">
          <div class="history-username">@${item.username}</div>
          <div class="history-date">${new Date(item.date).toLocaleString('ru-RU')}</div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  }

  async clearHistory() {
    if (confirm('Вы уверены, что хотите очистить историю подписок?')) {
      try {
        await chrome.storage.local.remove(['subscriptionHistory']);
        this.loadHistory();
        this.showSuccess('История подписок очищена');
      } catch (error) {
        console.error('Ошибка очистки истории:', error);
        this.showError('Ошибка очистки истории');
      }
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
          this.isRunning = response.isRunning;
          this.subscribedCount = response.subscribedCount || 0;
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
    const stopBtn = document.getElementById('stop-btn');

    // Обновляем статус
    if (this.isRunning) {
      statusIndicator.className = 'status-indicator status-running';
      statusText.textContent = 'Выполняется';
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusIndicator.className = 'status-indicator status-stopped';
      statusText.textContent = 'Остановлено';
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }

    // Обновляем счетчики
    subscribedCount.textContent = this.subscribedCount;
    targetCount.textContent = this.targetCount;

    // Обновляем прогресс бар
    const progress = this.targetCount > 0 ? (this.subscribedCount / this.targetCount) * 100 : 0;
    progressFill.style.width = `${Math.min(progress, 100)}%`;

    // Обновляем текст кнопок
    if (this.isRunning) {
      startBtn.textContent = '⏸️ Выполняется...';
      stopBtn.textContent = '⏹️ Остановить';
    } else {
      startBtn.textContent = '▶️ Начать подписку';
      stopBtn.textContent = '⏸️ Остановить';
    }
  }

  loadSettings() {
    chrome.storage.local.get(['delay', 'targetCount'], (result) => {
      if (result.delay) {
        this.delay = result.delay;
        document.getElementById('delay-input').value = this.delay;
      } else {
        // Устанавливаем значение по умолчанию
        document.getElementById('delay-input').value = this.delay;
      }
      
      if (result.targetCount) {
        this.targetCount = result.targetCount;
        document.getElementById('max-subscriptions-input').value = this.targetCount;
      } else {
        // Устанавливаем значение по умолчанию
        document.getElementById('max-subscriptions-input').value = this.targetCount;
      }
      
      // Обновляем UI после загрузки настроек
      this.updateUI();
      
      // Обновляем плавающую кнопку после загрузки настроек
      this.updateFloatingButton();
    });
  }

  saveSettings() {
    chrome.storage.local.set({
      delay: this.delay,
      targetCount: this.targetCount
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
  }
});

// Сохраняем ссылку на контроллер для доступа из обработчика сообщений
window.popupController = null;
