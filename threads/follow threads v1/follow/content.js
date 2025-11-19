// Threads Auto Follow Content Script
class ThreadsAutoFollow {
  constructor() {
    this.isRunning = false;
    this.delay = 2000; // 2 секунды между подписками
    this.subscribedCount = 0;
    this.targetCount = 50; // Цель по умолчанию
    this.buttons = [];
    
    this.init();
  }

  init() {
    console.log('Threads Auto Follow: Content script initialized');
    
    // Слушаем сообщения от popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'startFollow') {
        this.targetCount = request.targetCount || 50;
        this.delay = request.delay || 2000;
        this.startFollowing();
        sendResponse({status: 'started'});
      } else if (request.action === 'stopFollow') {
        this.stopFollowing();
        sendResponse({status: 'stopped'});
      } else if (request.action === 'getStatus') {
        sendResponse({
          isRunning: this.isRunning,
          subscribedCount: this.subscribedCount
        });
      } else if (request.action === 'updateTargetCount') {
        this.targetCount = request.targetCount || 50;
        this.updateStatus();
        sendResponse({status: 'updated'});
      }
    });

    // Добавляем кнопку управления на страницу только один раз
    this.addControlButton();
  }

  addControlButton() {
    // Удаляем старую кнопку если есть
    const existingButton = document.getElementById('threads-auto-follow-btn');
    if (existingButton) {
      existingButton.remove();
    }

    // Создаем кнопку управления
    const controlButton = document.createElement('div');
    controlButton.id = 'threads-auto-follow-btn';
    controlButton.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: #000000;
        color: #ffffff;
        padding: 10px 15px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        user-select: none;
        transition: all 0.2s ease;
        border: 1px solid #333333;
      " onmouseover="this.style.transform='scale(1.05)'; this.style.background='#1a1a1a'" onmouseout="this.style.transform='scale(1)'; this.style.background='#000000'">
        <div id="follow-status">🤖 Auto Follow</div>
        <div id="follow-count" style="font-size: 12px; margin-top: 4px; color: #a8a8a8;">0/50</div>
      </div>
    `;

    controlButton.addEventListener('click', () => {
      if (this.isRunning) {
        this.stopFollowing();
      } else {
        this.startFollowing();
      }
    });

    document.body.appendChild(controlButton);
  }

  findSubscribeButtons() {
    const buttons = [];
    console.log('Threads Auto Follow: Поиск кнопок подписки...');

    // Ищем в модальном окне подписчиков - больше селекторов
    const modal = document.querySelector('[role="dialog"]') ||
                  document.querySelector('.modal') ||
                  document.querySelector('[data-testid="modal"]') ||
                  document.querySelector('[aria-modal="true"]') ||
                  document.querySelector('[data-testid="followers-modal"]') ||
                  document.querySelector('[data-testid="following-modal"]') ||
                  document.querySelector('div[style*="position: fixed"]') ||
                  document.querySelector('div[style*="z-index"]');

    console.log('Threads Auto Follow: Найдено модальное окно:', modal);

    if (modal) {
      // Ищем только DIV элементы с текстом "Подписаться" в модальном окне
      const modalDivs = modal.querySelectorAll('div');
      console.log('Threads Auto Follow: DIV элементов в модальном окне:', modalDivs.length);

      modalDivs.forEach((div, index) => {
        const text = div.textContent.trim();
        if (text === 'Подписаться') {
          // Проверяем, что это кнопка подписки по классам и атрибутам
          const classes = div.className;
          const role = div.getAttribute('role');
          const tabindex = div.getAttribute('tabindex');
          
          if ((classes.includes('x1i10hfl') || classes.includes('x1ypdohk') || 
               classes.includes('xdl72j9') || classes.includes('x2lah0s')) &&
              (role === 'button' || tabindex === '0')) {
            buttons.push(div);
            console.log('Threads Auto Follow: Добавлена кнопка подписки в модальном окне:', text);
          }
        }
      });

      // Также ищем обычные кнопки в модальном окне
      const modalButtons = modal.querySelectorAll('button');
      console.log('Threads Auto Follow: Кнопок в модальном окне:', modalButtons.length);

      modalButtons.forEach((button, index) => {
        const text = button.textContent.trim();
        if (text === 'Подписаться' || text === 'Follow' ||
            text.includes('Подписаться') || text.includes('Follow') ||
            text === 'Subscribe' || text === 'Follow back') {
          buttons.push(button);
          console.log('Threads Auto Follow: Добавлена кнопка подписки:', text);
        }
      });
    }

    // Если не нашли кнопки в модальном окне, выводим сообщение
    if (buttons.length === 0) {
      console.log('Threads Auto Follow: Кнопки подписки не найдены в модальном окне');
      console.log('Threads Auto Follow: Убедитесь, что модальное окно подписчиков открыто');
    }

    // Удаляем дубликаты
    const uniqueButtons = [];
    buttons.forEach(button => {
      if (!uniqueButtons.includes(button)) {
        uniqueButtons.push(button);
      }
    });

    console.log('Threads Auto Follow: Итого найдено кнопок подписки:', uniqueButtons.length);
    return uniqueButtons;
  }

  async startFollowing() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.subscribedCount = 0;
    let totalProcessed = 0;

    this.updateStatus();
    this.showNotification(`Начинаем подписку на ${this.targetCount} пользователей`, 'info');

    while (this.isRunning && totalProcessed < this.targetCount) {
      // Ждем немного для загрузки модального окна
      await this.sleep(1000);
      
      // Ищем кнопки подписки
      this.buttons = this.findSubscribeButtons();

      if (this.buttons.length === 0) {
        // Пытаемся прокрутить вниз для загрузки новых пользователей
        await this.scrollToLoadMore();
        
        // Ждем немного для загрузки
        await this.sleep(2000);
        
        // Проверяем снова
        const newButtons = this.findSubscribeButtons();
        if (newButtons.length === 0) {
          this.showNotification('Больше нет пользователей для подписки', 'info');
          break;
        }
        continue;
      }

      // Подписываемся на пользователей по порядку
      for (let i = 0; i < this.buttons.length && this.isRunning && totalProcessed < this.targetCount; i++) {
        const button = this.buttons[i];
        
        try {
          // Прокручиваем к кнопке
          button.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await this.sleep(500);

          // Проверяем, что кнопка все еще видима и активна
          if (button.offsetParent !== null && !button.disabled) {
            // Извлекаем имя пользователя перед кликом
            const username = this.extractUsernameFromButton(button);
            
            // Кликаем по кнопке
            console.log(`Threads Auto Follow: Кликаем по кнопке ${totalProcessed + 1}:`, button);
            
            // Для DIV элементов используем dispatchEvent для более надежного клика
            if (button.tagName === 'DIV') {
              const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
              });
              button.dispatchEvent(clickEvent);
            } else {
              button.click();
            }
            
            // Ждем немного после клика
            await this.sleep(1000);
            
            this.subscribedCount++;
            totalProcessed++;
            this.updateStatus();
            
            // Сохраняем в историю
            await this.saveSubscriptionToHistory(username);
            
            this.showNotification(`Подписались на @${username} (${totalProcessed}/${this.targetCount})`, 'success');
          } else {
            console.log(`Threads Auto Follow: Кнопка ${totalProcessed + 1} неактивна или скрыта`);
          }

          // Ждем перед следующей подпиской
          if (i < this.buttons.length - 1 && totalProcessed < this.targetCount) {
            await this.sleep(this.delay);
          }

        } catch (error) {
          console.error('Ошибка при подписке:', error);
          this.showNotification(`Ошибка при подписке на пользователя ${totalProcessed + 1}`, 'error');
        }
      }

      // Прокручиваем вниз для загрузки новых пользователей
      await this.scrollToLoadMore();
      await this.sleep(2000);
    }

    if (this.isRunning) {
      this.showNotification(`Завершено! Подписались на ${totalProcessed} пользователей`, 'success');
      this.stopFollowing();
    }
  }

  stopFollowing() {
    this.isRunning = false;
    this.updateStatus();
  }

  updateStatus() {
    const statusElement = document.getElementById('follow-status');
    const countElement = document.getElementById('follow-count');
    
    if (statusElement) {
      statusElement.textContent = this.isRunning ? '⏸️ Остановить' : '🤖 Auto Follow';
    }
    
    if (countElement) {
      countElement.textContent = `${this.subscribedCount}/${this.targetCount}`;
    }

    // Отправляем обновление в popup
    chrome.runtime.sendMessage({
      action: 'statusUpdate',
      data: {
        isRunning: this.isRunning,
        subscribedCount: this.subscribedCount
      }
    });
  }

  showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10001;
      background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#ffffff' : '#1a1a1a'};
      color: ${type === 'success' ? '#000000' : '#ffffff'};
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      max-width: 300px;
      word-wrap: break-word;
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

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveSubscriptionToHistory(username) {
    try {
      const result = await chrome.storage.local.get(['subscriptionHistory']);
      const history = result.subscriptionHistory || [];
      
      // Добавляем новую подписку
      history.push({
        username: username,
        date: new Date().toISOString()
      });
      
      // Сохраняем обновленную историю
      await chrome.storage.local.set({ subscriptionHistory: history });
    } catch (error) {
      console.error('Ошибка сохранения в историю:', error);
    }
  }

  extractUsernameFromButton(button) {
    try {
      // Ищем родительский элемент с информацией о пользователе
      let parent = button.parentElement;
      let username = null;
      
      // Поднимаемся по DOM дереву в поисках имени пользователя
      for (let i = 0; i < 5 && parent; i++) {
        // Ищем элементы с текстом, который может быть именем пользователя
        const textElements = parent.querySelectorAll('span, div, a');
        
        for (const element of textElements) {
          const text = element.textContent.trim();
          // Проверяем, что это похоже на имя пользователя (не содержит "Подписаться", "Follow" и т.д.)
          if (text && 
              !text.includes('Подписаться') && 
              !text.includes('Follow') && 
              !text.includes('Subscribe') &&
              !text.includes('Запрос отправлен') &&
              text.length > 2 && 
              text.length < 50 &&
              !text.includes(' ') &&
              /^[a-zA-Z0-9._]+$/.test(text)) {
            username = text;
            break;
          }
        }
        
        if (username) break;
        parent = parent.parentElement;
      }
      
      return username || 'unknown_user';
    } catch (error) {
      console.error('Ошибка извлечения имени пользователя:', error);
      return 'unknown_user';
    }
  }

  async scrollToLoadMore() {
    // Ищем модальное окно
    const modal = document.querySelector('[role="dialog"]') ||
                  document.querySelector('.modal') ||
                  document.querySelector('[data-testid="modal"]') ||
                  document.querySelector('[aria-modal="true"]');

    if (modal) {
      // Ищем прокручиваемый контейнер внутри модального окна
      const scrollableContainer = modal.querySelector('[style*="overflow"]') ||
                                 modal.querySelector('[style*="scroll"]') ||
                                 modal.querySelector('div[style*="height"]') ||
                                 modal;

      if (scrollableContainer) {
        // Прокручиваем вниз
        scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
        console.log('Threads Auto Follow: Прокрутили вниз для загрузки новых пользователей');
      }
    }
  }

}

// Защита от множественной инициализации
if (!window.threadsAutoFollowInitialized) {
  window.threadsAutoFollowInitialized = true;
  
  // Инициализируем скрипт только после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new ThreadsAutoFollow();
    });
  } else {
    new ThreadsAutoFollow();
  }
}
