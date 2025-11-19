class HistoryController {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadHistory();
  }

  bindEvents() {
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const exportHistoryBtn = document.getElementById('export-history-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const backBtn = document.getElementById('back-btn');

    clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    exportHistoryBtn.addEventListener('click', () => this.exportHistory());
    refreshBtn.addEventListener('click', () => this.loadHistory());
    backBtn.addEventListener('click', () => this.goBackToThreads());
  }

  async loadHistory() {
    try {
      const result = await chrome.storage.local.get(['subscriptionHistory']);
      const history = result.subscriptionHistory || [];
      
      const historyList = document.getElementById('history-list');
      const historyStats = document.getElementById('history-stats');
      
      if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">История подписок пуста</div>';
        historyStats.style.display = 'none';
        return;
      }

      // Показываем статистику
      historyStats.style.display = 'flex';
      this.updateHistoryStats(history);

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
      this.showError('Ошибка загрузки истории');
    }
  }

  updateHistoryStats(history) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalSubscriptions = history.length;
    const todaySubscriptions = history.filter(item => new Date(item.date) >= today).length;
    const weekSubscriptions = history.filter(item => new Date(item.date) >= weekAgo).length;

    document.getElementById('total-subscriptions').textContent = totalSubscriptions;
    document.getElementById('today-subscriptions').textContent = todaySubscriptions;
    document.getElementById('week-subscriptions').textContent = weekSubscriptions;
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

  async exportHistory() {
    try {
      const result = await chrome.storage.local.get(['subscriptionHistory']);
      const history = result.subscriptionHistory || [];
      
      if (history.length === 0) {
        this.showError('История подписок пуста');
        return;
      }

      // Создаем CSV контент
      const csvContent = [
        'Username,Date,Time',
        ...history.map(item => {
          const date = new Date(item.date);
          return `@${item.username},"${date.toLocaleDateString('ru-RU')}","${date.toLocaleTimeString('ru-RU')}"`;
        })
      ].join('\n');

      // Создаем и скачиваем файл
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `threads_subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showSuccess('История экспортирована в CSV файл');
    } catch (error) {
      console.error('Ошибка экспорта истории:', error);
      this.showError('Ошибка экспорта истории');
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  async goBackToThreads() {
    try {
      // Ищем вкладку с Threads
      const tabs = await chrome.tabs.query({});
      const threadsTab = tabs.find(tab => 
        tab.url && (tab.url.includes('threads.net') || tab.url.includes('threads.com'))
      );
      
      if (threadsTab) {
        // Переключаемся на вкладку Threads
        await chrome.tabs.update(threadsTab.id, { active: true });
        // Закрываем текущую вкладку
        const currentTab = await chrome.tabs.getCurrent();
        if (currentTab) {
          await chrome.tabs.remove(currentTab.id);
        }
      } else {
        // Если нет вкладки Threads, открываем новую
        await chrome.tabs.create({
          url: 'https://threads.net'
        });
        // Закрываем текущую вкладку
        window.close();
      }
    } catch (error) {
      console.error('Ошибка возврата к Threads:', error);
      // Fallback - просто закрываем вкладку
      window.close();
    }
  }

  showNotification(message, type) {
    // Удаляем старые уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
      notification.remove();
    });

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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
  window.historyController = new HistoryController();
});
