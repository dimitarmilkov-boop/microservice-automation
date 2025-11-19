// Threads Auto Follow Background Script
chrome.runtime.onInstalled.addListener(() => {
  console.log('Threads Auto Follow extension installed');
  
  // Устанавливаем начальные настройки
  chrome.storage.local.set({
    delay: 2,
    isEnabled: true
  });
});

// Обработка сообщений между content script и popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'statusUpdate') {
    // Пересылаем обновление статуса в popup
    chrome.runtime.sendMessage({
      action: 'statusUpdate',
      data: request.data
    }).catch(() => {
      // Игнорируем ошибки если popup не открыт
    });
  }
});

// Обработка клика по иконке расширения
chrome.action.onClicked.addListener((tab) => {
  // Если popup не настроен, можно добавить логику для открытия popup
  console.log('Extension icon clicked');
});

// Обработка обновления вкладки
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && (tab.url.includes('threads.net') || tab.url.includes('threads.com'))) {
    // Вкладка Threads загружена, можно добавить дополнительную логику
    console.log('Threads tab loaded:', tab.url);
  }
});

// Обработка активации вкладки
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && (tab.url.includes('threads.net') || tab.url.includes('threads.com'))) {
      // Вкладка Threads активирована
      console.log('Threads tab activated');
    }
  });
});

// Функция для получения настроек
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['delay', 'isEnabled'], (result) => {
      resolve({
        delay: result.delay || 2,
        isEnabled: result.isEnabled !== false
      });
    });
  });
}

// Функция для сохранения настроек
async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set(settings, () => {
      resolve();
    });
  });
}

// Экспортируем функции для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getSettings,
    saveSettings
  };
}
