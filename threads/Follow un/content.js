// Threads Auto Follow Content Script
console.log('Threads Auto Follow: [DEBUG] Content script загружен');

class ThreadsAutoFollow {
  constructor() {
    console.log('Threads Auto Follow: [DEBUG] Инициализация ThreadsAutoFollow');
    this.isRunning = false;
    this.subscribedCount = 0;
    this.targetCount = 50; // Цель по умолчанию
    this.avatarFilter = 'all'; // Фильтр по аватарке
    this.nameFilter = 'all'; // Фильтр по имени
    this.nameLanguage = 'all'; // Язык имени
    this.onlineFilter = 'all'; // Фильтр по онлайн статусу
    this.whitelistKeywords = ''; // Белый список ключевых слов
    this.blacklistKeywords = ''; // Черный список ключевых слов
    this.buttons = [];
    this.interfaceLanguage = this.detectInterfaceLanguage(); // Определяем язык интерфейса
    this.minDelay = 2000; // Минимальная задержка в миллисекундах
    this.maxDelay = 8000; // Максимальная задержка в миллисекундах
    this.userList = []; // Список пользователей для подписки
    this.ignoreList = ''; // Игнор-список пользователей
    this.currentUserIndex = 0; // Текущий индекс пользователя из списка
    this.isFollowingUsersFromList = false; // Флаг работы со списком пользователей
    this.isUnfollowing = false; // Флаг активной отписки
    this.currentUsername = ''; // Текущий пользователь для подписки
    this.selectedMode = 'follow'; // Выбранный в UI режим (follow/unfollow)
    
    this.init();
  }

  // Проверяет, на странице ли собственного профиля (по кнопке Edit profile)
  async isOnOwnProfile() {
    try {
      const candidates = Array.from(document.querySelectorAll('button, [role="button"], a'));
      for (const el of candidates) {
        const t = (el.textContent || '').toLowerCase().trim();
        if (t.includes('edit profile') || t.includes('редактировать профиль') || t.includes('редагувати профіль')) {
          return true;
        }
        const aria = (el.getAttribute && (el.getAttribute('aria-label') || '')).toLowerCase();
        if (aria.includes('edit profile')) return true;
      }
    } catch {}
    // Дополнительная проверка по url вида /@username: ищем кнопку с текстом Edit profile вручную среди кнопок
    if (/\/@[\w.]+/i.test(location.pathname)) {
      const btns = Array.from(document.querySelectorAll('button, [role="button"], a'));
      for (const b of btns) {
        const t = (b.textContent || '').toLowerCase().trim();
        if (t.includes('edit profile') || t.includes('редактировать профиль') || t.includes('редагувати профіль')) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  // Навигация в собственный профиль
  async navigateToOwnProfile() {
    // 1) Сначала пробуем клик по иконке "человечек" (aria-label="Profile")
    let profileBtn = null;
    const profileIcon = document.querySelector('[aria-label="Profile"], [aria-label*="Профиль" i]');
    if (profileIcon) {
      profileBtn = profileIcon.closest('a, button, [role="button"]') || profileIcon;
      const hrefCandidate = profileBtn.getAttribute && (profileBtn.getAttribute('href') || '')
        || (profileIcon.getAttribute && profileIcon.getAttribute('href'))
        || '';
      try { profileBtn.click(); } catch {}
      for (let i = 0; i < 8; i++) {
        await this.sleep(400);
        if (await this.isOnOwnProfile()) return true;
      }
      if (hrefCandidate) {
        try { window.location.assign(hrefCandidate.startsWith('http') ? hrefCandidate : (window.location.origin + hrefCandidate)); } catch {}
        for (let i = 0; i < 8; i++) {
          await this.sleep(400);
          if (await this.isOnOwnProfile()) return true;
        }
      }
    }
    // 2) Если не нашли иконку — ищем ссылку /@username в навигации/шапке
    profileBtn = null;
    if (!profileBtn) {
      // Ищем любые ссылки /@username в левом сайдбаре/хедере
      const scope = document.querySelector('nav, [role="navigation"]') || document;
      const candidateLinks = Array.from(scope.querySelectorAll('a[href^="/@"], a[href*="threads.net/@"]'))
        .filter(a => {
          const href = a.getAttribute('href') || a.href || '';
          return /\/@[\w.]+(\/?$)/i.test(href);
        });
      // Выбираем самую короткую (без лишних параметров)
      candidateLinks.sort((a,b) => (a.getAttribute('href')||a.href).length - (b.getAttribute('href')||b.href).length);
      profileBtn = candidateLinks[0] || null;
    }
    if (profileBtn) {
      // Пытаемся кликнуть, а затем при необходимости перейти напрямую по href
      const href = profileBtn.getAttribute('href') || profileBtn.href;
      try { profileBtn.click(); } catch {}
      for (let i = 0; i < 8; i++) {
        await this.sleep(400);
        if (await this.isOnOwnProfile()) return true;
      }
      if (href) {
        try { window.location.assign(href.startsWith('http') ? href : (window.location.origin + href)); } catch {}
        for (let i = 0; i < 10; i++) {
          await this.sleep(400);
          if (await this.isOnOwnProfile()) return true;
        }
      }
    }

    // 3) Фоллбек: переход на главную и повторная попытка
    try { window.location.href = window.location.origin; } catch {}
    for (let i = 0; i < 15; i++) {
      await this.sleep(500);
      let btn = document.querySelector('a[aria-label="Profile"], a[aria-label*="Профиль" i]');
      if (!btn) {
        const nav = document.querySelector('nav, [role="navigation"]');
        if (nav) {
          btn = nav.querySelector('a[href^="/@"], a[href*="threads.net/@"]');
        }
      }
      if (btn) {
        const href = btn.getAttribute('href') || btn.href;
        try { btn.click(); } catch {}
        for (let j = 0; j < 10; j++) {
          await this.sleep(500);
          if (await this.isOnOwnProfile()) return true;
        }
        if (href) {
          try { window.location.assign(href.startsWith('http') ? href : (window.location.origin + href)); } catch {}
          for (let j = 0; j < 10; j++) {
            await this.sleep(400);
            if (await this.isOnOwnProfile()) return true;
          }
        }
      }
    }
    return false;
  }

  detectInterfaceLanguage() {
    // Определяем язык интерфейса по нескольким источникам
    const htmlLang = (document.documentElement.lang || '').toLowerCase();
    const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    const metaLocale = (document.querySelector('meta[property="og:locale"]')?.content || '').toLowerCase();
    const bodyText = (document.body.textContent || '').toLowerCase();
    
    // 1) По явным маркерам текста на странице
    if (bodyText.includes('подписаться') || bodyText.includes('подписчики') || bodyText.includes('подписки')) return 'ru';
    if (bodyText.includes('follow') || bodyText.includes('followers') || bodyText.includes('following')) return 'en';
    
    // 2) По html lang / meta locale / navigator
    if (htmlLang.startsWith('ru') || metaLocale.startsWith('ru') || navLang.startsWith('ru')) return 'ru';
    if (htmlLang.startsWith('en') || metaLocale.startsWith('en') || navLang.startsWith('en')) return 'en';
    
    // 3) По умолчанию возвращаем en
    return 'en';
  }

  getSubscribeButtonTexts() {
    // Возвращаем тексты кнопок подписки в зависимости от языка интерфейса
    const buttonTexts = {
      ru: ['Подписаться', 'Подписаться'],
      en: ['Follow', 'Follow back', 'Subscribe']
    };
    
    // Объединяем все возможные тексты для универсальности
    return [...buttonTexts.ru, ...buttonTexts.en];
  }

  getExcludedTexts() {
    // Возвращаем тексты, которые нужно исключить при поиске имен пользователей
    return [
      'Подписаться', 'Follow', 'Subscribe', 'Follow back',
      'Запрос отправлен', 'Request sent',
      'Подписки', 'Подписчики', 'Following', 'Followers'
    ];
  }

  getRandomDelay() {
    // Возвращаем случайную задержку между minDelay и maxDelay
    const randomDelay = Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
    console.log(`Threads Auto Follow: [DEBUG] Случайная задержка: ${randomDelay}мс (${randomDelay/1000}с)`);
    return randomDelay;
  }

  // Определяем язык имени пользователя
  detectNameLanguage(name) {
    if (!name || name.trim() === '') {
      return 'empty';
    }
    
    // Проверяем наличие кириллических символов
    const cyrillicRegex = /[а-яё]/i;
    // Проверяем наличие латинских символов
    const latinRegex = /[a-z]/i;
    // Проверяем наличие арабских/персидских символов (расширенный диапазон)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    // Проверяем наличие эмодзи и специальных символов (но не считаем их нелатинскими для фильтрации)
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    // Проверяем наличие других нелатинских символов (исключая эмодзи)
    const otherNonLatinRegex = /[^\x00-\x7F\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    
    const hasCyrillic = cyrillicRegex.test(name);
    const hasLatin = latinRegex.test(name);
    const hasArabic = arabicRegex.test(name);
    const hasEmoji = emojiRegex.test(name);
    const hasOtherNonLatin = otherNonLatinRegex.test(name);
    
    // Если есть кириллица, считаем кириллическим
    if (hasCyrillic) {
      return 'cyrillic';
    }
    
    // Если есть арабские символы, считаем арабским
    if (hasArabic) {
      return 'arabic';
    }
    
    // Если есть только латинские символы, цифры, спецсимволы и эмодзи, считаем латинским
    if (hasLatin && !hasOtherNonLatin) {
      return 'latin';
    }
    
    // Если есть другие нелатинские символы, считаем смешанным
    if (hasOtherNonLatin) {
      return 'mixed';
    }
    
    return 'other';
  }

  // Проверяем, содержит ли имя ключевые слова из списка
  containsKeywords(name, keywordsString) {
    if (!keywordsString || keywordsString.trim() === '') {
      return true; // Если список пустой, считаем что подходит
    }
    
    // Разделяем по переносам строк и запятым для совместимости
    const keywords = keywordsString
      .split(/[\n,]/)
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);
    
    if (keywords.length === 0) {
      return true;
    }
    
    const nameLower = name.toLowerCase();
    return keywords.some(keyword => nameLower.includes(keyword));
  }

  // Проверяем, исключает ли имя ключевые слова из черного списка
  excludesKeywords(name, keywordsString) {
    if (!keywordsString || keywordsString.trim() === '') {
      return true; // Если список пустой, считаем что подходит
    }
    
    // Разделяем по переносам строк и запятым для совместимости
    const keywords = keywordsString
      .split(/[\n,]/)
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);
    
    if (keywords.length === 0) {
      return true;
    }
    
    const nameLower = name.toLowerCase();
    return !keywords.some(keyword => nameLower.includes(keyword));
  }

  // Основная функция фильтрации по имени
  shouldSubscribeToUserByName(username, displayName) {
    console.log(`Threads Auto Follow: [DEBUG] shouldSubscribeToUserByName called with username: "${username}", displayName: "${displayName}"`);
    
    // Определяем, какое имя использовать для фильтрации (приоритет displayName)
    const nameToCheck = displayName && displayName.trim() !== '' ? displayName : username;
    console.log(`Threads Auto Follow: [DEBUG] Используем для фильтрации имя: "${nameToCheck}"`);
    
    // Проверяем фильтр по наличию имени
    if (this.nameFilter === 'with-name') {
      if (!nameToCheck || nameToCheck.trim() === '') {
        console.log(`Threads Auto Follow: [DEBUG] Фильтр "только с именем": имя пустое, пропускаем`);
        return false;
      }
    } else if (this.nameFilter === 'without-name') {
      if (nameToCheck && nameToCheck.trim() !== '') {
        console.log(`Threads Auto Follow: [DEBUG] Фильтр "только без имени": имя есть, пропускаем`);
        return false;
      }
    }
    
    // Проверяем фильтр по языку имени
    if (this.nameLanguage !== 'all') {
      const nameLang = this.detectNameLanguage(nameToCheck);
      console.log(`Threads Auto Follow: [DEBUG] Язык имени: ${nameLang}`);
      
      // Нормализуем значения к нижнему регистру для сравнения
      const normalizedNameLang = nameLang.toLowerCase();
      
      if (this.nameLanguage === 'cyrillic' && normalizedNameLang !== 'cyrillic') {
        console.log(`Threads Auto Follow: [DEBUG] Фильтр "кириллица": язык не кириллица, пропускаем`);
        return false;
      } else if (this.nameLanguage === 'latin') {
        // Для латиницы принимаем только чистую латиницу, без смешанных языков
        if (normalizedNameLang !== 'latin') {
          console.log(`Threads Auto Follow: [DEBUG] Фильтр "латиница": язык не латиница (${nameLang}), пропускаем`);
          return false;
        }
      }
    }
    
    // Проверяем белый список (должно содержать)
    if (!this.containsKeywords(nameToCheck, this.whitelistKeywords)) {
      console.log(`Threads Auto Follow: [DEBUG] Белый список: имя не содержит нужных ключевых слов, пропускаем`);
      return false;
    }
    
    // Проверяем черный список (исключить)
    if (!this.excludesKeywords(nameToCheck, this.blacklistKeywords)) {
      console.log(`Threads Auto Follow: [DEBUG] Черный список: имя содержит запрещенные ключевые слова, пропускаем`);
      return false;
    }
    
    console.log(`Threads Auto Follow: [DEBUG] Все фильтры имени пройдены, подписываемся`);
    return true;
  }

  async openFollowersList() {
    console.log('Threads Auto Follow: Пытаемся открыть список подписчиков...');
    
    // Отладочная информация - показываем все элементы с текстом "followers"
    const allElements = document.querySelectorAll('*');
    const followersElements = [];
    for (const element of allElements) {
      const text = element.textContent.toLowerCase().trim();
      if (text.includes('followers')) {
        followersElements.push({
          tagName: element.tagName,
          text: text.substring(0, 100), // Первые 100 символов
          role: element.getAttribute('role'),
          tabindex: element.getAttribute('tabindex'),
          className: element.className.substring(0, 50) // Первые 50 символов класса
        });
      }
    }
    console.log('Threads Auto Follow: Найдены элементы с "followers":', followersElements);
    
    let followersButton = null;
    
    // Специальный поиск для структуры с числом подписчиков (например, "421 followers")
    // Сначала ищем span элементы с точным текстом
    const spanElements = document.querySelectorAll('span');
    for (const span of spanElements) {
      const text = span.textContent.toLowerCase().trim();
      
      // Ищем точные совпадения для английского интерфейса
      if (text === 'followers' || text.match(/^\d+\s+followers$/)) {
        console.log(`Threads Auto Follow: Найден span с текстом: "${text}"`);
        
        // Ищем родительский кликабельный элемент
        let parent = span.parentElement;
        while (parent && parent !== document.body) {
          const parentRole = parent.getAttribute('role');
          const parentTabindex = parent.getAttribute('tabindex');
          const parentTag = parent.tagName.toLowerCase();
          
          console.log(`Threads Auto Follow: Проверяем родительский элемент: ${parentTag}, role: ${parentRole}, tabindex: ${parentTabindex}`);
          
          if (parentRole === 'button' || 
              parentTabindex === '0' ||
              parentTag === 'button' ||
              parentTag === 'a') {
            followersButton = parent;
            console.log(`Threads Auto Follow: Найдена кнопка подписчиков по span: "${text}", элемент: ${parentTag}`);
            break;
          }
          parent = parent.parentElement;
        }
        if (followersButton) break;
      }
      
      // Ищем для русского интерфейса
      if (text === 'подписчики' || text === 'подписчиков' || text.match(/^\d+\s+подписчиков?$/)) {
        console.log(`Threads Auto Follow: Найден span с текстом: "${text}"`);
        
        let parent = span.parentElement;
        while (parent && parent !== document.body) {
          const parentRole = parent.getAttribute('role');
          const parentTabindex = parent.getAttribute('tabindex');
          const parentTag = parent.tagName.toLowerCase();
          
          if (parentRole === 'button' || 
              parentTabindex === '0' ||
              parentTag === 'button' ||
              parentTag === 'a') {
            followersButton = parent;
            console.log(`Threads Auto Follow: Найдена кнопка подписчиков по span: "${text}", элемент: ${parentTag}`);
            break;
          }
          parent = parent.parentElement;
        }
        if (followersButton) break;
      }
    }
    
    // Если не нашли по span, ищем div элементы с role="button"
    if (!followersButton) {
      const buttonDivs = document.querySelectorAll('div[role="button"]');
      for (const div of buttonDivs) {
        const text = div.textContent.toLowerCase().trim();
        
        // Проверяем, что текст содержит только число и followers
        if (text.match(/^\d+\s+followers$/)) {
          followersButton = div;
          console.log(`Threads Auto Follow: Найдена кнопка подписчиков по div: "${text}"`);
          break;
        }
        
        // Для русского интерфейса
        if (text.match(/^\d+\s+подписчиков?$/)) {
          followersButton = div;
          console.log(`Threads Auto Follow: Найдена кнопка подписчиков по div: "${text}"`);
          break;
        }
      }
    }
    
    // Если не нашли по паттерну, используем старый метод
    if (!followersButton) {
      const followersSelectors = [
        'a[href*="/followers"]',
        'a[href*="/followers/"]',
        'a[href*="followers"]',
        'button[aria-label*="followers"]',
        'button[aria-label*="подписчики"]',
        'div[role="button"][tabindex="0"]'
      ];

      // Пробуем разные селекторы
      for (const selector of followersSelectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const text = element.textContent.toLowerCase().trim();
            if (text.includes('followers') || text.includes('подписчики') || text.includes('подписчиков')) {
              // Проверяем, что это не кнопка подписки
              if (!text.includes('follow') && !text.includes('подписаться') && !text.includes('subscribe')) {
                followersButton = element;
                console.log(`Threads Auto Follow: Найдена кнопка подписчиков с селектором: ${selector}, текст: "${text}"`);
                break;
              }
            }
          }
          if (followersButton) break;
        } catch (e) {
          // Игнорируем ошибки с селекторами
        }
      }

      // Если не нашли по селекторам, ищем по тексту более тщательно
      if (!followersButton) {
        const textElements = document.querySelectorAll('a, button, div[role="button"], span, div');
        for (const element of textElements) {
          const text = element.textContent.toLowerCase().trim();
          
          // Ищем точные совпадения для английского интерфейса
          if (text === 'followers' || (text.includes('followers') && text.length < 20)) {
            // Проверяем, что это не кнопка подписки
            if (!text.includes('follow') && !text.includes('подписаться') && !text.includes('subscribe')) {
              // Дополнительная проверка - ищем родительский элемент с кликабельностью
              let clickableElement = element;
              if (element.tagName.toLowerCase() === 'span') {
                // Ищем родительский div с role="button"
                let parent = element.parentElement;
                while (parent && parent !== document.body) {
                  if (parent.getAttribute('role') === 'button' || parent.getAttribute('tabindex') === '0') {
                    clickableElement = parent;
                    break;
                  }
                  parent = parent.parentElement;
                }
              }
              
              followersButton = clickableElement;
              console.log(`Threads Auto Follow: Найдена кнопка подписчиков по тексту: "${text}", элемент: ${clickableElement.tagName}`);
              break;
            }
          }
          
          // Ищем для русского интерфейса
          if (text.includes('подписчики') || text.includes('подписчиков')) {
            if (!text.includes('подписаться')) {
              let clickableElement = element;
              if (element.tagName.toLowerCase() === 'span') {
                let parent = element.parentElement;
                while (parent && parent !== document.body) {
                  if (parent.getAttribute('role') === 'button' || parent.getAttribute('tabindex') === '0') {
                    clickableElement = parent;
                    break;
                  }
                  parent = parent.parentElement;
                }
              }
              
              followersButton = clickableElement;
              console.log(`Threads Auto Follow: Найдена кнопка подписчиков по тексту: "${text}", элемент: ${clickableElement.tagName}`);
              break;
            }
          }
        }
      }
    }

    // Последний англ. фоллбек: ищем ближайший кликабельный предок текста "followers"
    if (!followersButton) {
      try {
        const xpath = "//*[contains(translate(normalize-space(text()), 'FOLLOWERS', 'followers'), 'followers')]";
        const iterator = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let node = iterator.iterateNext();
        while (node) {
          let candidate = node;
          let depth = 0;
          while (candidate && candidate !== document.body && depth < 6) {
            const role = candidate.getAttribute?.('role');
            const tabindex = candidate.getAttribute?.('tabindex');
            const tag = candidate.tagName?.toLowerCase();
            if (tag === 'a' || tag === 'button' || role === 'button' || tabindex === '0') {
              followersButton = candidate;
              break;
            }
            candidate = candidate.parentElement;
            depth++;
          }
          if (followersButton) break;
          node = iterator.iterateNext();
        }
      } catch (e) {}
    }

    if (followersButton) {
      try {
        console.log(`Threads Auto Follow: Найдена кнопка подписчиков:`, {
          tagName: followersButton.tagName,
          className: followersButton.className,
          role: followersButton.getAttribute('role'),
          tabindex: followersButton.getAttribute('tabindex'),
          text: followersButton.textContent.trim()
        });
        
        // Прокручиваем к кнопке, если она не видна
        followersButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.sleep(1000);
        
        // Проверяем, что кнопка видима и кликабельна
        const rect = followersButton.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         rect.top >= 0 && rect.left >= 0 &&
                         rect.bottom <= window.innerHeight && 
                         rect.right <= window.innerWidth;
        
        if (!isVisible) {
          console.log('Threads Auto Follow: Кнопка не видима, пытаемся прокрутить еще раз');
          followersButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await this.sleep(1000);
        }
        
        // Пробуем разные способы клика
        let clickSuccess = false;
        
        // Способ 1: Обычный клик
        try {
          followersButton.click();
          clickSuccess = true;
          console.log('Threads Auto Follow: Обычный клик выполнен');
        } catch (e) {
          console.log('Threads Auto Follow: Обычный клик не сработал:', e);
        }
        
        // Способ 2: Программный клик через MouseEvent
        if (!clickSuccess) {
          try {
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            followersButton.dispatchEvent(clickEvent);
            clickSuccess = true;
            console.log('Threads Auto Follow: Программный клик выполнен');
          } catch (e) {
            console.log('Threads Auto Follow: Программный клик не сработал:', e);
          }
        }
        
        if (!clickSuccess) {
          console.log('Threads Auto Follow: Не удалось кликнуть по кнопке');
          return false;
        }
        
        // Ждем, пока откроется модальное окно
        await this.sleep(3000);
        
        // Проверяем, открылось ли модальное окно
        const modal = document.querySelector('[role="dialog"]') ||
                     document.querySelector('.modal') ||
                     document.querySelector('[data-testid="modal"]') ||
                     document.querySelector('[aria-modal="true"]') ||
                     document.querySelector('[data-testid="followers-modal"]') ||
                     document.querySelector('[data-testid="following-modal"]');
        
        if (modal) {
          console.log('Threads Auto Follow: Модальное окно подписчиков успешно открыто');
          return true;
        } else {
          console.log('Threads Auto Follow: Модальное окно не открылось');
          return false;
        }
      } catch (error) {
        console.error('Threads Auto Follow: Ошибка при клике по кнопке подписчиков:', error);
        return false;
      }
    } else {
      console.log('Threads Auto Follow: Кнопка подписчиков не найдена');
      return false;
    }
  }

  async openFollowingList() {
    console.log('Threads Auto Follow: Пытаемся открыть список подписок...');
    
    // Отладочная информация - показываем все элементы с текстом "following"
    const allElements = document.querySelectorAll('*');
    const followingElements = [];
    for (const element of allElements) {
      const text = element.textContent.toLowerCase().trim();
      if (text.includes('following')) {
        followingElements.push({
          tagName: element.tagName,
          text: text.substring(0, 100), // Первые 100 символов
          role: element.getAttribute('role'),
          tabindex: element.getAttribute('tabindex'),
          className: element.className.substring(0, 50) // Первые 50 символов класса
        });
      }
    }
    console.log('Threads Auto Follow: Найдены элементы с "following":', followingElements);
    
    let followingButton = null;
    
    // Специальный поиск для структуры с числом подписок (например, "123 following")
    // Сначала ищем span элементы с точным текстом
    const spanElements = document.querySelectorAll('span');
    for (const span of spanElements) {
      const text = span.textContent.toLowerCase().trim();
      
      // Ищем точные совпадения для английского интерфейса
      if (text === 'following' || text.match(/^\d+\s+following$/)) {
        console.log(`Threads Auto Follow: Найден span с текстом: "${text}"`);
        
        // Ищем родительский кликабельный элемент
        let parent = span.parentElement;
        while (parent && parent !== document.body) {
          const parentRole = parent.getAttribute('role');
          const parentTabindex = parent.getAttribute('tabindex');
          const parentTag = parent.tagName.toLowerCase();
          
          console.log(`Threads Auto Follow: Проверяем родительский элемент: ${parentTag}, role: ${parentRole}, tabindex: ${parentTabindex}`);
          
          if (parentRole === 'button' || 
              parentTabindex === '0' ||
              parentTag === 'button' ||
              parentTag === 'a') {
            followingButton = parent;
            console.log(`Threads Auto Follow: Найдена кнопка подписок по span: "${text}", элемент: ${parentTag}`);
            break;
          }
          parent = parent.parentElement;
        }
        if (followingButton) break;
      }
      
      // Ищем для русского интерфейса
      if (text === 'подписки' || text === 'подписок' || text.match(/^\d+\s+подписок?$/)) {
        console.log(`Threads Auto Follow: Найден span с текстом: "${text}"`);
        
        let parent = span.parentElement;
        while (parent && parent !== document.body) {
          const parentRole = parent.getAttribute('role');
          const parentTabindex = parent.getAttribute('tabindex');
          const parentTag = parent.tagName.toLowerCase();
          
          if (parentRole === 'button' || 
              parentTabindex === '0' ||
              parentTag === 'button' ||
              parentTag === 'a') {
            followingButton = parent;
            console.log(`Threads Auto Follow: Найдена кнопка подписок по span: "${text}", элемент: ${parentTag}`);
            break;
          }
          parent = parent.parentElement;
        }
        if (followingButton) break;
      }
    }
    
    // Если не нашли по span, ищем div элементы с role="button"
    if (!followingButton) {
      const buttonDivs = document.querySelectorAll('div[role="button"]');
      for (const div of buttonDivs) {
        const text = div.textContent.toLowerCase().trim();
        
        // Проверяем, что текст содержит только число и following
        if (text.match(/^\d+\s+following$/)) {
          followingButton = div;
          console.log(`Threads Auto Follow: Найдена кнопка подписок по div: "${text}"`);
          break;
        }
        
        // Для русского интерфейса
        if (text.match(/^\d+\s+подписок?$/)) {
          followingButton = div;
          console.log(`Threads Auto Follow: Найдена кнопка подписок по div: "${text}"`);
          break;
        }
      }
    }
    
    // Если не нашли по паттерну, используем старый метод
    if (!followingButton) {
      const followingSelectors = [
        'a[href*="/following"]',
        'a[href*="/following/"]',
        'a[href*="following"]',
        'button[aria-label*="following"]',
        'button[aria-label*="подписки"]',
        'div[role="button"][tabindex="0"]'
      ];

      // Пробуем разные селекторы
      for (const selector of followingSelectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const text = element.textContent.toLowerCase().trim();
            if (text.includes('following') || text.includes('подписки') || text.includes('подписок')) {
              // Проверяем, что это не кнопка подписки
              if (!text.includes('follow') && !text.includes('подписаться') && !text.includes('subscribe')) {
                followingButton = element;
                console.log(`Threads Auto Follow: Найдена кнопка подписок с селектором: ${selector}, текст: "${text}"`);
                break;
              }
            }
          }
          if (followingButton) break;
        } catch (e) {
          // Игнорируем ошибки с селекторами
        }
      }

      // Если не нашли по селекторам, ищем по тексту более тщательно
      if (!followingButton) {
        const textElements = document.querySelectorAll('a, button, div[role="button"], span, div');
        for (const element of textElements) {
          const text = element.textContent.toLowerCase().trim();
          
          // Ищем точные совпадения для английского интерфейса
          if (text === 'following' || (text.includes('following') && text.length < 20)) {
            // Проверяем, что это не кнопка подписки
            if (!text.includes('follow') && !text.includes('подписаться') && !text.includes('subscribe')) {
              // Дополнительная проверка - ищем родительский элемент с кликабельностью
              let clickableElement = element;
              if (element.tagName.toLowerCase() === 'span') {
                // Ищем родительский div с role="button"
                let parent = element.parentElement;
                while (parent && parent !== document.body) {
                  if (parent.getAttribute('role') === 'button' || parent.getAttribute('tabindex') === '0') {
                    clickableElement = parent;
                    break;
                  }
                  parent = parent.parentElement;
                }
              }
              
              followingButton = clickableElement;
              console.log(`Threads Auto Follow: Найдена кнопка подписок по тексту: "${text}", элемент: ${clickableElement.tagName}`);
              break;
            }
          }
          
          // Ищем для русского интерфейса
          if (text.includes('подписки') || text.includes('подписок')) {
            if (!text.includes('подписаться')) {
              let clickableElement = element;
              if (element.tagName.toLowerCase() === 'span') {
                let parent = element.parentElement;
                while (parent && parent !== document.body) {
                  if (parent.getAttribute('role') === 'button' || parent.getAttribute('tabindex') === '0') {
                    clickableElement = parent;
                    break;
                  }
                  parent = parent.parentElement;
                }
              }
              
              followingButton = clickableElement;
              console.log(`Threads Auto Follow: Найдена кнопка подписок по тексту: "${text}", элемент: ${clickableElement.tagName}`);
              break;
            }
          }
        }
      }
    }

    if (followingButton) {
      try {
        // Прокручиваем к кнопке, если она не видна
        followingButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.sleep(500);
        
        // Кликаем по кнопке
        followingButton.click();
        console.log('Threads Auto Follow: Кликнули по кнопке подписок');
        
        // Ждем, пока откроется модальное окно
        await this.sleep(2000);
        
        // Проверяем, открылось ли модальное окно
        const modal = document.querySelector('[role="dialog"]') ||
                     document.querySelector('.modal') ||
                     document.querySelector('[data-testid="modal"]') ||
                     document.querySelector('[aria-modal="true"]') ||
                     document.querySelector('[data-testid="followers-modal"]') ||
                     document.querySelector('[data-testid="following-modal"]');
        
        if (modal) {
          console.log('Threads Auto Follow: Модальное окно подписок успешно открыто');
          return true;
        } else {
          console.log('Threads Auto Follow: Модальное окно не открылось');
          return false;
        }
      } catch (error) {
        console.error('Threads Auto Follow: Ошибка при клике по кнопке подписок:', error);
        return false;
      }
    } else {
      console.log('Threads Auto Follow: Кнопка подписок не найдена');
      return false;
    }
  }

  async init() {
    console.log('Threads Auto Follow: Content script initialized');
    console.log(`Threads Auto Follow: Определен язык интерфейса: ${this.interfaceLanguage}`);
    
    // Загружаем сохраненное состояние
    await this.loadState();
    
    // Добавляем обработчик видимости страницы для работы в фоне
    this.setupVisibilityHandler();
    
    // Проверяем, нужно ли продолжить работу со списком пользователей
    if (this.isFollowingUsersFromList && this.isRunning) {
      console.log(`Threads Auto Follow: [DEBUG] Продолжаем работу со списком пользователей`);
      this.continueFollowingUsersFromList();
    }
    
    // Слушаем сообщения от popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(`Threads Auto Follow: [DEBUG] Получено сообщение:`, request.action);
      
      // Всегда возвращаем ответ, чтобы избежать ошибок соединения
      const respond = (response) => {
        try {
          sendResponse(response);
        } catch (error) {
          console.error('Threads Auto Follow: [ERROR] Ошибка отправки ответа:', error);
        }
      };
      if (request.action === 'startFollow') {
        console.log(`Threads Auto Follow: [DEBUG] Получено сообщение startFollow:`, request);
        this.targetCount = request.targetCount || 50;
        this.avatarFilter = request.avatarFilter || 'all';
        this.nameFilter = request.nameFilter || 'all';
        this.nameLanguage = request.nameLanguage || 'all';
        this.onlineFilter = request.onlineFilter || 'all';
        this.whitelistKeywords = request.whitelistKeywords || '';
        this.blacklistKeywords = request.blacklistKeywords || '';
        this.minDelay = request.minDelay || 2000;
        this.maxDelay = request.maxDelay || 8000;
        this.userList = request.userList || [];
        this.ignoreList = request.ignoreList || '';
        this.currentUserIndex = 0;
        this.isFollowingUsersFromList = this.userList.length > 0;
        this.currentUsername = '';
        console.log(`Threads Auto Follow: [DEBUG] Установлен avatarFilter: ${this.avatarFilter}`);
        console.log(`Threads Auto Follow: [DEBUG] Установлен nameFilter: ${this.nameFilter}`);
        console.log(`Threads Auto Follow: [DEBUG] Установлен nameLanguage: ${this.nameLanguage}`);
        console.log(`Threads Auto Follow: [DEBUG] Установлен onlineFilter: ${this.onlineFilter}`);
        console.log(`Threads Auto Follow: [DEBUG] Белый список: ${this.whitelistKeywords}`);
        console.log(`Threads Auto Follow: [DEBUG] Черный список: ${this.blacklistKeywords}`);
        console.log(`Threads Auto Follow: [DEBUG] Задержка: мин: ${this.minDelay}мс, макс: ${this.maxDelay}мс`);
        console.log(`Threads Auto Follow: [DEBUG] Список пользователей: ${this.userList.length} пользователей`);
        console.log(`Threads Auto Follow: [DEBUG] Игнор-список: ${this.ignoreList.length} пользователей`);
        
        // Сохраняем состояние перед запуском
        this.saveState();
        
        this.startFollowing();
        respond({status: 'started'});
      } else if (request.action === 'stopFollow') {
        this.stopFollowing();
        respond({status: 'stopped'});
      } else if (request.action === 'getStatus') {
        respond({
          isRunning: this.isRunning,
          isUnfollowing: !!this.isUnfollowing,
          subscribedCount: this.subscribedCount,
          unfollowedCount: this.unfollowedCount || 0,
          targetCount: this.targetCount || 0
        });
      } else if (request.action === 'updateTargetCount') {
        this.targetCount = request.targetCount || 50;
        this.updateStatus();
        this.addControlButton(); // Обновляем плавающую кнопку
        respond({status: 'updated'});
      } else if (request.action === 'startParsing') {
        console.log(`Threads Auto Follow: [DEBUG] Получен запрос на запуск парсинга`);
        this.enableFollowerParsing = request.enableFollowerParsing;
        this.isParsing = true;
        this.parsedUsernames = [];
        
        console.log(`Threads Auto Follow: [DEBUG] Запуск парсинга текущего списка подписчиков`);
        this.showNotification('Начинаем парсинг подписчиков из открытого списка', 'info');
        
        // Проверяем, есть ли модальное окно с подписчиками
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          console.log('Threads Auto Follow: [DEBUG] Модальное окно найдено, запускаем парсинг');
        this.startParsing();
          respond({status: 'started'});
        } else {
          console.log('Threads Auto Follow: [DEBUG] Модальное окно не найдено');
          this.showNotification('Откройте список подписчиков для парсинга', 'error');
          respond({status: 'no_modal'});
        }
      } else if (request.action === 'showHistoryModal') {
        this.showHistoryModal();
        respond({status: 'shown'});
      } else if (request.action === 'scanDOM') {
        this.scanDOM();
        respond({status: 'scanned'});
      } else if (request.action === 'settingsChanged') {
        if (typeof request.minDelay === 'number') this.minDelay = request.minDelay * 1000;
        if (typeof request.maxDelay === 'number') this.maxDelay = request.maxDelay * 1000;
        if (typeof request.targetCount === 'number') this.targetCount = request.targetCount;
        if (request.startMode) this.selectedMode = request.startMode === 'unfollow' ? 'unfollow' : 'follow';
        this.updateStatus();
        respond({status: 'updated'});
      } else if (request.action === 'startUnfollow') {
        console.log('Threads Auto Follow: [DEBUG] Получен запрос на запуск отписки');
        if (request.minDelay) this.minDelay = request.minDelay;
        if (request.maxDelay) this.maxDelay = request.maxDelay;
        if (request.targetCount) this.targetCount = request.targetCount;
        this.unfollowedCount = 0;
        this.startUnfollowing()
          .then(() => respond({ status: 'started' }))
          .catch((e) => {
            console.error('Threads Auto Follow: [ERROR] Не удалось запустить отписку', e);
            respond({ status: 'error', message: e?.message || String(e) });
          });
      } else if (request.action === 'stopUnfollow') {
        console.log('Threads Auto Follow: [DEBUG] Получен запрос на остановку отписки');
        this.isUnfollowing = false;
        respond({ status: 'stopped' });
      } else if (request.action === 'ping') {
        // Проверка готовности content script
        console.log('Threads Auto Follow: [DEBUG] Получен ping, отвечаем pong');
        respond({status: 'pong', ready: true});
      } else {
        // Неизвестное действие
        console.log(`Threads Auto Follow: [DEBUG] Неизвестное действие: ${request.action}`);
        respond({status: 'unknown_action'});
      }
      
      // Всегда возвращаем true для асинхронных операций
      return true;
    });

    // Добавляем кнопку управления на страницу только один раз
    this.addControlButton();
  }

  // Запуск сценария отписки: открываем список подписок и начинаем отписываться
  async startUnfollowing() {
    try {
      // 0) Убедимся, что мы на своей странице профиля
      const onOwn = await this.isOnOwnProfile();
      if (!onOwn) {
        console.log('Threads Auto Follow: [DEBUG] Не на своей странице. Переходим в профиль...');
        const ok = await this.navigateToOwnProfile();
        if (!ok) {
          console.log('Threads Auto Follow: [DEBUG] Не удалось перейти в профиль. Останавливаемся');
          this.showNotification('Откройте свой профиль для отписки', 'error');
          return;
        }
      }

      this.isUnfollowing = true;
      // Если уже открыто модальное окно, попробуем переключиться на вкладку "Подписки"
      let modal = document.querySelector('[role="dialog"]');
      if (!modal) {
        await this.openFollowersList(); // большинство профилей открывает модалку этим путем
        await this.sleep(800);
        modal = document.querySelector('[role="dialog"]');
      }

      // Переключаемся на вкладку Подписки, если доступна вкладочная шапка
      await this.switchToFollowingTab(modal);
      await this.sleep(600);

      // Стартуем основной цикл отписки
      await this.unfollowLoop(modal);
      // Финальный сброс состояния, чтобы popup разблокировал кнопку
      this.isUnfollowing = false;
      this.updateStatus && this.updateStatus();
    } catch (e) {
      console.error('Threads Auto Follow: [ERROR] startUnfollowing failed', e);
      throw e;
    }
  }

  // Переключение вкладки в модалке на "Подписки"/"Following"
  async switchToFollowingTab(modal) {
    try {
      const root = modal || document;
      const candidates = Array.from(root.querySelectorAll('*'))
        .filter(el => {
          const text = (el.textContent || '').toLowerCase();
          return (
            text.includes('подписки') ||
            text.includes('following')
          );
        });

      // Ищем верхнюю таб-кнопку с маленьким количеством текста
      const tab = candidates.find(el => {
        const t = (el.textContent || '').trim();
        return t.length <= 20 && (el.getAttribute('role') === 'tab' || el.tagName === 'DIV' || el.tagName === 'SPAN');
      });

      if (tab) {
        tab.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.sleep(150);
        try { tab.click(); } catch {}
        try {
          const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
          tab.dispatchEvent(evt);
        } catch {}
        console.log('Threads Auto Follow: [DEBUG] Переключились на вкладку Подписки');
      } else {
        console.log('Threads Auto Follow: [DEBUG] Вкладка Подписки не найдена, попытаемся открыть списком openFollowingList');
        await this.openFollowingList();
      }
    } catch (e) {
      console.log('Threads Auto Follow: [DEBUG] Ошибка при переключении вкладки Подписки', e);
    }
  }

  async unfollowLoop(modal) {
    const container = this.findScrollableContainer(modal) || modal;
    let processed = 0;
    let idleRounds = 0;

    while (this.isUnfollowing && idleRounds <= 20) {
      if (this.targetCount && this.unfollowedCount >= this.targetCount) {
        console.log('Threads Auto Follow: [DEBUG] Достигнут лимит отписок:', this.unfollowedCount);
        this.isUnfollowing = false;
        break;
      }
      const unfollowed = await this.unfollowVisibleUsers(modal);
      processed += unfollowed;
      if (unfollowed === 0) idleRounds++; else idleRounds = 0;

      // Прокручиваем
      container.scrollTop += container.clientHeight * 0.9;
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 1200, deltaMode: 0 }));
      await this.sleep(700);
    }

    console.log(`Threads Auto Follow: [DEBUG] Отписка завершена. Обработано ${processed}`);
  }

  // Отписка по видимым карточкам
  async unfollowVisibleUsers(modal) {
    const listRoot = modal || document;
    const items = Array.from(listRoot.querySelectorAll('div[role="button"], div'));
    let unfollowedCount = 0;

    for (const item of items) {
      if (!this.isUnfollowing) break;
      if (this.targetCount && this.unfollowedCount >= this.targetCount) break;
      const text = (item.textContent || '').toLowerCase();
      // Ищем кнопки, которые означают, что мы уже подписаны: "Подписки", "Following"
      if (
        /(^|\s)(подписки|following)(\s|$)/i.test(text)
      ) {
        // Найдём кликабельный элемент внутри
        const btn = item.matches('button, [role="button"]') ? item : (item.querySelector('button, [role="button"]') || item);
        try {
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await this.sleep(80);
          btn.click();
        } catch {}
        await this.sleep(150);

        // Появится подтверждение: кликаем "Отменить подписку"/"Unfollow"
        const confirmed = await this.confirmUnfollowIfDialog();
        if (confirmed) {
          unfollowedCount++;
          this.unfollowedCount = (this.unfollowedCount || 0) + 1;
          const delay = this.getRandomDelay();
          console.log(`Threads Auto Follow: [DEBUG] Отписались. Пауза ${delay}мс. Прогресс ${this.unfollowedCount}/${this.targetCount || '∞'}`);
          await this.sleep(delay);
        } else {
          await this.sleep(150);
        }
      }
    }

    return unfollowedCount;
  }

  // Находит модальное подтверждение отписки и подтверждает
  async confirmUnfollowIfDialog() {
    const start = Date.now();
    const isVisible = (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };

    while (Date.now() - start < 6000) {
      // Ищем любой видимый элемент-кнопку с нужным текстом
      const candidates = Array.from(document.querySelectorAll('[role="dialog"] button, [role="dialog"] [role="button"], button, [role="button"]'));
      let target = null;
      for (const el of candidates) {
        const t = (el.textContent || '').toLowerCase().replace(/\s+/g, ' ').trim();
        if (!isVisible(el)) continue;
        if (t.includes('отменить подписку') || t === 'unfollow' || t.includes('скасувати підписку')) {
          target = el; break;
        }
      }

      if (target) {
        try {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await this.sleep(80);
          target.click();
          // подстрахуемся синтетическими событиями
          const evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
          target.dispatchEvent(evt);
        } catch {}
        await this.sleep(120);
        return true;
      }

      await this.sleep(150);
    }
    return false;
  }

  addControlButton() {
    // Удаляем старую кнопку если есть
    const existingButton = document.getElementById('threads-auto-follow-btn');
    if (existingButton) {
      existingButton.remove();
    }

    // Получаем текущую тему
    chrome.storage.local.get(['theme'], (result) => {
      const theme = result.theme || 'dark';
      
      // Создаем кнопку управления
      const controlButton = document.createElement('div');
      controlButton.id = 'threads-auto-follow-btn';
      
      // Стили для темной темы
      let buttonStyles = `
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
      `;
      
      let hoverStyles = "this.style.transform='scale(1.05)'; this.style.background='#1a1a1a'";
      let normalStyles = "this.style.transform='scale(1)'; this.style.background='#000000'";
      let countColor = "#a8a8a8";
      
      // Стили для светлой темы
      if (theme === 'light') {
        buttonStyles = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          background: #ffffff;
          color: #000000;
          padding: 10px 15px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          user-select: none;
          transition: all 0.2s ease;
          border: 1px solid #e9ecef;
        `;
        hoverStyles = "this.style.transform='scale(1.05)'; this.style.background='#f8f9fa'";
        normalStyles = "this.style.transform='scale(1)'; this.style.background='#ffffff'";
        countColor = "#6c757d";
      }
      
      const minSec = Math.max(0, Math.round((this.minDelay || 2000) / 1000));
      const maxSec = Math.max(minSec, Math.round((this.maxDelay || 8000) / 1000));
      const currentCount = this.isUnfollowing ? (this.unfollowedCount || 0) : this.subscribedCount;
      const modeLabel = this.isUnfollowing ? 'unfollow' : (this.selectedMode || 'follow');
      
      controlButton.innerHTML = `
        <div style="${buttonStyles}" onmouseover="${hoverStyles}" onmouseout="${normalStyles}">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div>
          <div id="follow-status">🤖 Auto Follow</div>
              <div id="follow-count" style="font-size: 12px; margin-top: 4px; color: ${countColor};">${currentCount}/${this.targetCount || 0}</div>
              <div id="follow-delay" style="font-size: 11px; margin-top: 2px; color: ${countColor};">⏱️ ${minSec}-${maxSec}s</div>
              <div id="follow-mode" style="font-size: 11px; margin-top: 2px; color: ${countColor};">mode: ${modeLabel}</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <button id="follow-start-btn" style="background:#ffffff;color:#000000;border:none;border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;">Start</button>
              <button id="follow-stop-btn" style="background:#1a1a1a;color:#ffffff;border:1px solid #444;border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;">Stop</button>
            </div>
          </div>
        </div>
      `;

      const startBtn = controlButton.querySelector('#follow-start-btn');
      const stopBtn = controlButton.querySelector('#follow-stop-btn');
      startBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const { startMode } = await chrome.storage.local.get(['startMode']);
          const mode = startMode === 'unfollow' ? 'unfollow' : 'follow';
          this.selectedMode = mode;
          this.showNotification(mode === 'unfollow' ? 'Запуск отписки' : 'Запуск подписки', 'info');
          if (mode === 'unfollow') {
            this.startUnfollowing();
        } else {
            this.startFollowing();
          }
        } catch {
          this.selectedMode = 'follow';
          this.showNotification('Запуск подписки', 'info');
          this.startFollowing();
        }
      });
      stopBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isUnfollowing) {
          this.isUnfollowing = false;
        }
        if (this.isRunning) {
          this.stopFollowing();
        }
        this.showNotification('Остановлено', 'info');
      });

      document.body.appendChild(controlButton);

      // Подписываемся на изменения storage, чтобы панель сразу обновлялась (лимит/паузы/режим)
      try {
        chrome.storage.onChanged.addListener((changes, area) => {
          if (area !== 'local') return;
          if (changes.targetCount?.newValue !== undefined) this.targetCount = changes.targetCount.newValue;
          if (changes.minDelay?.newValue !== undefined) this.minDelay = changes.minDelay.newValue * 1000 || this.minDelay;
          if (changes.maxDelay?.newValue !== undefined) this.maxDelay = changes.maxDelay.newValue * 1000 || this.maxDelay;
          if (changes.startMode?.newValue !== undefined) {
            this.selectedMode = changes.startMode.newValue === 'unfollow' ? 'unfollow' : 'follow';
          }
          this.updateStatus();
        });
      } catch {}

      // Инициализируем выбранный режим для отображения
      chrome.storage.local.get(['startMode'], (res) => {
        if (res && res.startMode) this.selectedMode = res.startMode === 'unfollow' ? 'unfollow' : 'follow';
        this.updateStatus();
      });
    });
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
      // Ищем все элементы, которые могут быть кнопками подписки
      const allElements = modal.querySelectorAll('div, button, span');
      console.log('Threads Auto Follow: Всего элементов для проверки:', allElements.length);

      allElements.forEach((element, index) => {
        const text = element.textContent.trim();
        // Универсальная поддержка разных языков интерфейса
        const subscribeButtonTexts = this.getSubscribeButtonTexts();
        const isSubscribeButton = subscribeButtonTexts.includes(text);
        
        if (isSubscribeButton) {
          // Проверяем, что это действительно кнопка подписки
          const classes = element.className;
          const role = element.getAttribute('role');
          const tabindex = element.getAttribute('tabindex');
          const tagName = element.tagName.toLowerCase();
          
          // Более гибкая проверка для кнопок
          const isClickable = role === 'button' || 
                             tabindex === '0' || 
                             tagName === 'button' ||
                             classes.includes('x1i10hfl') || 
                             classes.includes('x1ypdohk') || 
                             classes.includes('xdl72j9') || 
                             classes.includes('x2lah0s');
          
          if (isClickable) {
            buttons.push(element);
            console.log('Threads Auto Follow: Добавлена кнопка подписки:', text, 'Tag:', tagName, 'Role:', role);
          }
        }
      });

      // Дополнительный поиск по более специфичным селекторам
      const specificButtons = modal.querySelectorAll('div[role="button"], button, div[tabindex="0"]');
      console.log('Threads Auto Follow: Найдено элементов с role="button" или tabindex="0":', specificButtons.length);

      specificButtons.forEach((element) => {
        const text = element.textContent.trim();
        const subscribeButtonTexts = this.getSubscribeButtonTexts();
        const isSubscribeButton = subscribeButtonTexts.includes(text);
        
        if (isSubscribeButton && !buttons.includes(element)) {
          buttons.push(element);
          console.log('Threads Auto Follow: Добавлена кнопка подписки (специфичный поиск):', text);
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
    let noNewUsersCount = 0; // Счетчик для отслеживания отсутствия новых пользователей
    const maxNoNewUsersAttempts = 25; // Увеличиваем количество попыток
    let lastButtonCount = 0; // Запоминаем количество кнопок в предыдущей итерации
    let processedButtons = new Set(); // Отслеживаем обработанные кнопки

    this.updateStatus();
    
    // Проверяем, нужно ли работать со списком пользователей
    if (this.shouldWorkWithUserList()) {
      console.log(`Threads Auto Follow: [DEBUG] Работаем со списком пользователей: ${this.userList.length} пользователей`);
      this.showNotification(`Начинаем подписку по списку пользователей (${this.userList.length} пользователей)`, 'info');
      
      // Запускаем подписку на пользователей из списка
      await this.followUsersFromList();
      return;
    } else {
      this.showNotification(`Начинаем подписку на ${this.targetCount} пользователей`, 'info');
    }
    
    console.log(`Threads Auto Follow: Фильтр по аватарке: ${this.avatarFilter}`);
    console.log(`Threads Auto Follow: [DEBUG] avatarFilter получен: ${this.avatarFilter}`);

    // Сначала проверяем, не открыто ли уже модальное окно
    const existingModal = document.querySelector('[role="dialog"]') ||
                         document.querySelector('.modal') ||
                         document.querySelector('[data-testid="modal"]') ||
                         document.querySelector('[aria-modal="true"]') ||
                         document.querySelector('[data-testid="followers-modal"]') ||
                         document.querySelector('[data-testid="following-modal"]');
    
    let listOpened = false;
    
    if (existingModal) {
      console.log('Threads Auto Follow: Модальное окно уже открыто, пропускаем открытие списка');
      listOpened = true;
      
      // Если включен автопарсинг, запускаем его
      if (this.enableFollowerParsing && this.isParsing) {
        console.log('Threads Auto Follow: [DEBUG] Запускаем автопарсинг из открытого модального окна');
        await this.parseFollowersFromModal();
        return;
      }
    } else {
      // Пытаемся открыть список подписчиков
      listOpened = await this.openFollowersList();
      
      // Если включен автопарсинг, запускаем его после открытия
      if (listOpened && this.enableFollowerParsing && this.isParsing) {
        console.log('Threads Auto Follow: [DEBUG] Запускаем автопарсинг после открытия модального окна');
        await this.sleep(2000); // Ждем загрузки модального окна
        await this.parseFollowersFromModal();
        return;
      }
    }
    
    if (!listOpened) {
      this.showNotification('Не удалось открыть список подписчиков. Убедитесь, что вы находитесь на странице профиля.', 'error');
      this.isRunning = false;
      this.updateStatus();
      return;
    }

    while (this.isRunning && totalProcessed < this.targetCount) {
      // Ждем немного для загрузки модального окна
      await this.sleep(1000);
      
      // Ищем кнопки подписки
      this.buttons = this.findSubscribeButtons();
      const currentButtonCount = this.buttons.length;

      console.log(`Threads Auto Follow: Найдено кнопок подписки: ${currentButtonCount}`);
      console.log(`Threads Auto Follow: Предыдущее количество кнопок: ${lastButtonCount}`);

      if (this.buttons.length === 0) {
        console.log('Threads Auto Follow: Нет кнопок подписки, пытаемся прокрутить для загрузки новых пользователей');
        
        // Пытаемся прокрутить вниз для загрузки новых пользователей
        const scrolled = await this.scrollToLoadMore();
        
        if (!scrolled) {
          console.log('Threads Auto Follow: Не удалось прокрутить, возможно достигнут конец списка');
          noNewUsersCount++;
          
          if (noNewUsersCount >= maxNoNewUsersAttempts) {
            console.log('Threads Auto Follow: Достигнут конец списка, больше нет пользователей для подписки');
            this.showNotification('Больше нет пользователей для подписки', 'info');
            break;
          }
          
          // Ждем немного и пробуем снова
          await this.sleep(3000);
          continue;
        }
        
        // Ждем для загрузки новых пользователей
        await this.sleep(3000);
        
        // Проверяем, появились ли новые кнопки
        const newButtons = this.findSubscribeButtons();
        const newButtonCount = newButtons.length;
        
        console.log(`Threads Auto Follow: После прокрутки найдено кнопок: ${newButtonCount}`);
        
        if (newButtonCount === 0) {
          console.log('Threads Auto Follow: После прокрутки кнопки не найдены');
          noNewUsersCount++;
          
          if (noNewUsersCount >= maxNoNewUsersAttempts) {
            console.log('Threads Auto Follow: Достигнут конец списка, больше нет пользователей для подписки');
            this.showNotification('Больше нет пользователей для подписки', 'info');
            break;
          }
          
          continue;
        } else if (newButtonCount <= lastButtonCount) {
          console.log('Threads Auto Follow: Новых пользователей не загрузилось или загрузилось меньше');
          noNewUsersCount++;
          
          if (noNewUsersCount >= maxNoNewUsersAttempts) {
            console.log('Threads Auto Follow: Достигнут конец списка, больше нет пользователей для подписки');
            this.showNotification('Больше нет пользователей для подписки', 'info');
            break;
          }
          
          continue;
        } else {
          console.log(`Threads Auto Follow: Загружено новых пользователей: ${newButtonCount - lastButtonCount}`);
          noNewUsersCount = 0; // Сбрасываем счетчик, так как нашли новых пользователей
          this.buttons = newButtons;
          lastButtonCount = newButtonCount;
        }
      } else {
        // Если нашли кнопки, обновляем счетчик
        lastButtonCount = currentButtonCount;
      }

      // Подписываемся на пользователей по порядку
      let processedInThisBatch = 0;
      for (let i = 0; i < this.buttons.length && this.isRunning && totalProcessed < this.targetCount; i++) {
        const button = this.buttons[i];
        
        // Проверяем, не обрабатывали ли мы уже эту кнопку
        const buttonId = this.getButtonId(button);
        if (processedButtons.has(buttonId)) {
          console.log(`Threads Auto Follow: Кнопка ${i + 1} уже обработана, пропускаем`);
          continue;
        }
        
        try {
          // Прокручиваем к кнопке
          button.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await this.sleep(500);

          // Проверяем, что кнопка все еще видима и активна
          if (button.offsetParent !== null && !button.disabled) {
            // Извлекаем имя пользователя и аватарку перед кликом
            const userInfo = this.extractUsernameFromButton(button);
            const username = userInfo.username;
            const displayName = userInfo.displayName;
            const avatarUrl = this.extractUserAvatar(button);
            
            // Применяем фильтрацию по аватарке
            const hasAvatar = avatarUrl !== null && avatarUrl !== undefined && avatarUrl.trim() !== '';
            const shouldSubscribeAvatar = this.shouldSubscribeToUser(avatarUrl);
            
            // Применяем фильтрацию по имени
            const shouldSubscribeName = this.shouldSubscribeToUserByName(username, displayName);
            
            // Применяем фильтрацию по онлайн статусу
            const shouldSubscribeOnline = this.shouldSubscribeToUserByOnlineStatus(button);
            
            // Проверяем, находится ли пользователь в игнор-списке
            const isInIgnoreList = this.isUserInIgnoreList(username);
            
            // Проверяем, подписаны ли мы уже на этого пользователя
            const isAlreadySubscribed = this.isAlreadySubscribedFromButton(button);
            
            console.log(`Threads Auto Follow: Пользователь ${username}:`);
            console.log(`  - Display Name: ${displayName || 'нет'}`);
            console.log(`  - Аватарка: ${hasAvatar ? 'есть' : 'нет'}`);
            console.log(`  - URL аватарки: ${avatarUrl || 'не найдена'}`);
            console.log(`  - Фильтр аватарки: ${this.avatarFilter}`);
            console.log(`  - Фильтр имени: ${this.nameFilter}`);
            console.log(`  - Язык имени: ${this.nameLanguage}`);
            console.log(`  - Фильтр онлайн: ${this.onlineFilter}`);
            console.log(`  - Подписываться (аватарка): ${shouldSubscribeAvatar ? 'да' : 'нет'}`);
            console.log(`  - Подписываться (имя): ${shouldSubscribeName ? 'да' : 'нет'}`);
            console.log(`  - Подписываться (онлайн): ${shouldSubscribeOnline ? 'да' : 'нет'}`);
            console.log(`  - В игнор-списке: ${isInIgnoreList ? 'да' : 'нет'}`);
            console.log(`  - Уже подписан: ${isAlreadySubscribed ? 'да' : 'нет'}`);
            
            // Если уже подписан, добавляем в игнор-список
            if (isAlreadySubscribed) {
              console.log(`Threads Auto Follow: Пользователь ${username} уже подписан, добавляем в игнор-список`);
              this.addToIgnoreList(username);
              processedButtons.add(buttonId); // Отмечаем как обработанную
              continue;
            }
            
            if (!shouldSubscribeAvatar || !shouldSubscribeName || !shouldSubscribeOnline || isInIgnoreList) {
              if (isInIgnoreList) {
                console.log(`Threads Auto Follow: Пропускаем пользователя ${username} - находится в игнор-списке`);
              } else {
                console.log(`Threads Auto Follow: Пропускаем пользователя ${username} из-за фильтров`);
              }
              processedButtons.add(buttonId); // Отмечаем как обработанную
              continue;
            }
            
            // Кликаем по кнопке
            console.log(`Threads Auto Follow: Кликаем по кнопке ${totalProcessed + 1}:`, button);
            console.log(`Threads Auto Follow: Пользователь: ${username}, Аватарка: ${avatarUrl}`);
            
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
            processedInThisBatch++;
            processedButtons.add(buttonId); // Отмечаем как обработанную
            this.updateStatus();
            
            // Добавляем пользователя в игнор-список, чтобы не подписываться на него снова
            this.addToIgnoreList(username);
            
            // Сохраняем в историю с аватаркой и полными данными
            await this.saveSubscriptionToHistory(username, displayName, avatarUrl, button);
            
            this.showNotification(`Подписались на @${username} (${totalProcessed}/${this.targetCount})`, 'success');
          } else {
            console.log(`Threads Auto Follow: Кнопка ${totalProcessed + 1} неактивна или скрыта`);
            processedButtons.add(buttonId); // Отмечаем как обработанную
          }

          // Ждем перед следующей подпиской
          if (i < this.buttons.length - 1 && totalProcessed < this.targetCount) {
            const currentDelay = this.getRandomDelay();
            await this.sleep(currentDelay);
          }

        } catch (error) {
          console.error('Ошибка при подписке:', error);
          this.showNotification(`Ошибка при подписке на пользователя ${totalProcessed + 1}`, 'error');
          processedButtons.add(buttonId); // Отмечаем как обработанную
        }
      }

      // Если обработали всех пользователей в текущей партии, прокручиваем для загрузки новых
      if (processedInThisBatch > 0) {
        console.log(`Threads Auto Follow: Обработано пользователей в текущей партии: ${processedInThisBatch}`);
        console.log('Threads Auto Follow: Прокручиваем для загрузки новых пользователей');
        
        // Прокручиваем вниз для загрузки новых пользователей
        const scrolled = await this.scrollToLoadMore();
        
        if (scrolled) {
          // Ждем для загрузки новых пользователей
          await this.sleep(3000);
          noNewUsersCount = 0; // Сбрасываем счетчик, так как прокрутили
        } else {
          console.log('Threads Auto Follow: Не удалось прокрутить, возможно достигнут конец списка');
          noNewUsersCount++;
          
          // Дополнительная попытка прокрутки до самого конца
          if (noNewUsersCount >= 3) {
            console.log('Threads Auto Follow: Пробуем прокрутить до самого конца списка');
            const modal = document.querySelector('[role="dialog"]') ||
                          document.querySelector('.modal') ||
                          document.querySelector('[data-testid="modal"]') ||
                          document.querySelector('[aria-modal="true"]');
            
            if (modal) {
              const scrollableContainer = modal.querySelector('[style*="overflow"]') ||
                                         modal.querySelector('[style*="scroll"]') ||
                                         modal.querySelector('div[style*="height"]') ||
                                         modal;
              
              if (scrollableContainer) {
                // Прокручиваем до самого конца
                scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
                await this.sleep(3000); // Ждем дольше
                
                // Проверяем, загрузился ли новый контент
                const finalButtonCount = this.findSubscribeButtons().length;
                if (finalButtonCount > lastButtonCount) {
                  console.log('Threads Auto Follow: Дополнительная прокрутка сработала!');
                  noNewUsersCount = 0; // Сбрасываем счетчик
                  continue;
                }
              }
            }
          }
          
          if (noNewUsersCount >= maxNoNewUsersAttempts) {
            console.log('Threads Auto Follow: Достигнут конец списка, больше нет пользователей для подписки');
            this.showNotification('Больше нет пользователей для подписки', 'info');
            break;
          }
        }
      } else {
        // Если не обработали ни одного пользователя, увеличиваем счетчик
        noNewUsersCount++;
        
        if (noNewUsersCount >= maxNoNewUsersAttempts) {
          console.log('Threads Auto Follow: Достигнут конец списка, больше нет пользователей для подписки');
          this.showNotification('Больше нет пользователей для подписки', 'info');
          break;
        }
        
        // Пытаемся прокрутить для загрузки новых пользователей
        const scrolled = await this.scrollToLoadMore();
        
        if (scrolled) {
          await this.sleep(3000);
          noNewUsersCount = 0; // Сбрасываем счетчик, так как прокрутили
        }
      }
    }

    if (this.isRunning) {
      this.showNotification(`Завершено! Подписались на ${totalProcessed} пользователей`, 'success');
      this.stopFollowing();
    }
  }

  stopFollowing() {
    this.isRunning = false;
    this.isFollowingUsersFromList = false;
    this.currentUsername = '';
    this.enableFollowerParsing = false;
    this.isParsing = false;
    this.parsedUsernames = [];
    this.updateStatus();
    this.clearState();
    
    // Очищаем состояние парсинга в storage
    chrome.storage.local.set({
      'parsingInProgress': false,
      'parsingProgress': null
    }).catch(error => {
      console.error('Threads Auto Follow: [ERROR] Ошибка очистки состояния парсинга:', error);
    });
  }

  updateStatus() {
    const statusElement = document.getElementById('follow-status');
    const countElement = document.getElementById('follow-count');
    const delayElement = document.getElementById('follow-delay');
    const modeElement = document.getElementById('follow-mode');
    const startBtn = document.getElementById('follow-start-btn');
    const stopBtn = document.getElementById('follow-stop-btn');
    
    if (statusElement) {
      statusElement.textContent = this.isRunning ? '⏸️ Остановить' : '🤖 Auto Follow';
    }
    
    if (countElement) {
      const currentCount = this.isUnfollowing ? (this.unfollowedCount || 0) : this.subscribedCount;
      countElement.textContent = `${currentCount}/${this.targetCount}`;
    }

    if (delayElement) {
      const minSec = Math.max(0, Math.round((this.minDelay || 2000) / 1000));
      const maxSec = Math.max(minSec, Math.round((this.maxDelay || 8000) / 1000));
      delayElement.textContent = `⏱️ ${minSec}-${maxSec}s`;
    }

    if (modeElement) {
      const mode = this.isUnfollowing ? 'unfollow' : (this.isRunning ? 'follow' : (this.selectedMode || 'follow'));
      modeElement.textContent = `mode: ${mode}`;
    }

    if (startBtn && stopBtn) {
      if (this.isRunning || this.isUnfollowing) {
        startBtn.setAttribute('disabled', 'true');
        startBtn.style.opacity = '0.6';
        stopBtn.removeAttribute('disabled');
        stopBtn.style.opacity = '1';
      } else {
        stopBtn.setAttribute('disabled', 'true');
        stopBtn.style.opacity = '0.6';
        startBtn.removeAttribute('disabled');
        startBtn.style.opacity = '1';
      }
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

  async saveSubscriptionToHistory(username, displayName, avatarUrl, buttonElement = null) {
    try {
      const result = await chrome.storage.local.get(['subscriptionHistory']);
      const history = result.subscriptionHistory || [];
      
      // Создаем полную запись о пользователе
      const userRecord = {
        username: username,
        displayName: displayName,
        avatarUrl: avatarUrl,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        
        // Фильтры, которые были применены
        filters: {
          avatarFilter: this.avatarFilter,
          nameFilter: this.nameFilter,
          nameLanguage: this.nameLanguage,
          whitelistKeywords: this.whitelistKeywords,
          blacklistKeywords: this.blacklistKeywords,
          minDelay: this.minDelay,
          maxDelay: this.maxDelay
        },
        
        // Детальная информация о пользователе
        userData: {
          hasAvatar: avatarUrl !== null && avatarUrl !== undefined && avatarUrl.trim() !== '',
          isDefaultAvatar: this.isDefaultAvatar(avatarUrl),
          nameLanguage: this.detectNameLanguage(displayName || username),
          profileUrl: `https://www.threads.net/@${username}`,
          displayNameLength: displayName ? displayName.length : 0,
          usernameLength: username ? username.length : 0,
          bio: null, // Можно добавить извлечение bio в будущем
          verified: false, // Можно добавить извлечение статуса верификации
          private: false, // Можно добавить извлечение статуса приватности
          business: false, // Можно добавить извлечение статуса бизнес-аккаунта
          followers: null, // Можно добавить извлечение количества подписчиков
          following: null, // Можно добавить извлечение количества подписок
          posts: null // Можно добавить извлечение количества постов
        },
        
        // Информация о кнопке (если доступна)
        buttonInfo: buttonElement ? {
          tagName: buttonElement.tagName,
          className: buttonElement.className,
          role: buttonElement.getAttribute('role'),
          tabindex: buttonElement.getAttribute('tabindex'),
          textContent: buttonElement.textContent?.trim() || ''
        } : null,
        
        // Метаданные сессии
        sessionInfo: {
          targetCount: this.targetCount,
          subscribedCount: this.subscribedCount,
          sessionId: this.sessionId || Date.now().toString()
        }
      };
      
      // Добавляем новую подписку
      history.push(userRecord);
      
      // Сохраняем обновленную историю
      await chrome.storage.local.set({ subscriptionHistory: history });
      
      console.log(`Threads Auto Follow: Сохранено в историю: ${username}`, userRecord);
    } catch (error) {
      console.error('Ошибка сохранения в историю:', error);
    }
  }

  getButtonId(button) {
    try {
      // Создаем уникальный ID для кнопки на основе её позиции и содержимого
      const userInfo = this.extractUsernameFromButton(button);
      const username = userInfo.username;
      const buttonText = button.textContent.trim();
      const buttonClasses = button.className;
      
      // Создаем ID на основе имени пользователя и текста кнопки
      return `${username}_${buttonText}_${buttonClasses}`;
    } catch (error) {
      console.error('Ошибка создания ID кнопки:', error);
      return `button_${Math.random().toString(36).substr(2, 8)}`;
    }
  }

  extractUsernameFromButton(button) {
    try {
      // Ищем родительский элемент с информацией о пользователе
      let parent = button.parentElement;
      let username = null;
      let displayName = null;
      
      // Поднимаемся по DOM дереву в поисках имени пользователя
      for (let i = 0; i < 3 && parent; i++) { // Еще больше уменьшили глубину поиска
        // Ищем только в прямых дочерних элементах текущего родителя
        const directChildren = Array.from(parent.children);
        
        for (const child of directChildren) {
          // Ищем текстовые элементы только в этом дочернем элементе, но не глубже
          const textElements = Array.from(child.children).filter(el => 
            ['span', 'div', 'a', 'h1', 'h2', 'h3'].includes(el.tagName.toLowerCase())
          );
          
          // Также проверяем сам дочерний элемент, если он содержит текст
          if (child.textContent && child.textContent.trim()) {
            textElements.unshift(child);
          }
          
          for (const element of textElements) {
            const text = element.textContent.trim();
            const excludedTexts = this.getExcludedTexts();
            const isExcluded = excludedTexts.some(excludedText => text.includes(excludedText));
            
            if (text && 
                !isExcluded &&
                text.length > 1 && 
                text.length < 100) {
              
              // Проверяем, это username (без пробелов, только латиница/цифры/точки/подчеркивания)
              if (!text.includes(' ') && /^[a-zA-Z0-9._]+$/.test(text) && text.length >= 3) {
                // Проверяем, не содержит ли текст несколько username подряд (например: "samira.d.8177Samira.8177")
                const usernameParts = text.match(/[a-zA-Z0-9._]+/g);
                if (usernameParts && usernameParts.length > 1) {
                  // Если найдено несколько частей, берем первую как username
                  if (!username) {
                    username = usernameParts[0];
                    console.log(`Threads Auto Follow: [DEBUG] Найден username из составного текста: "${username}"`);
                  }
                  // Остальные части могут быть display name
                  if (!displayName && usernameParts.length > 1) {
                    // Исключаем первую часть (username) и берем остальные как display name
                    const displayNameParts = usernameParts.slice(1);
                    // Фильтруем части, которые выглядят как username (только латиница/цифры/точки/подчеркивания)
                    const filteredParts = displayNameParts.filter(part => 
                      !/^[a-zA-Z0-9._]+$/.test(part) || part.length < 3
                    );
                    if (filteredParts.length > 0) {
                      displayName = filteredParts.join(' ');
                      console.log(`Threads Auto Follow: [DEBUG] Найден display name из составного текста: "${displayName}"`);
                    }
                  }
                } else {
                  // Обычный случай - один username
                  if (!username) {
                    username = text;
                    console.log(`Threads Auto Follow: [DEBUG] Найден username: "${username}"`);
                  }
                }
              } 
              // Проверяем, это display name (содержит пробелы или кириллицу/арабские символы)
              else if (text.includes(' ') || /[а-яё\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/i.test(text)) {
                if (!displayName) {
                  displayName = text;
                  console.log(`Threads Auto Follow: [DEBUG] Найден display name: "${displayName}"`);
                }
              }
              // Если это короткий текст без пробелов, но не username, может быть частью display name
              else if (!text.includes(' ') && text.length >= 2 && text.length <= 20) {
                // Проверяем, не является ли это частью уже найденного display name
                if (!displayName && !username) {
                  displayName = text;
                  console.log(`Threads Auto Follow: [DEBUG] Найден короткий display name: "${displayName}"`);
                }
              }
            }
          }
        }
        
        if (username && displayName) break;
        parent = parent.parentElement;
      }
      
      // Если не нашли username, но есть display name, используем его
      if (!username && displayName) {
        // Извлекаем username из display name (первая часть до пробела или специальных символов)
        const usernameMatch = displayName.match(/^([a-zA-Z0-9._]+)/);
        if (usernameMatch) {
          username = usernameMatch[1];
          console.log(`Threads Auto Follow: [DEBUG] Извлечен username из display name: "${username}"`);
        } else {
          username = displayName.replace(/[^a-zA-Z0-9._]/g, '').substring(0, 20);
          console.log(`Threads Auto Follow: [DEBUG] Очищен username из display name: "${username}"`);
        }
      }
      
      // Дополнительная проверка: если username содержит display name, разделяем их
      if (username && !displayName) {
        // Ищем паттерн где username содержит и username и display name (например: "samira.d.8177Samira.8177")
        const combinedMatch = username.match(/^([a-zA-Z0-9._]+)([A-Z][a-zA-Z0-9._]*)$/);
        if (combinedMatch) {
          const extractedUsername = combinedMatch[1];
          const extractedDisplayName = combinedMatch[2];
          username = extractedUsername;
          displayName = extractedDisplayName;
          console.log(`Threads Auto Follow: [DEBUG] Разделен составной username: username="${username}", displayName="${displayName}"`);
        }
      }
      
      // Дополнительная проверка: если display name содержит username в начале, удаляем его
      if (username && displayName && displayName.startsWith(username)) {
        const cleanedDisplayName = displayName.substring(username.length).trim();
        if (cleanedDisplayName.length > 0) {
          displayName = cleanedDisplayName;
          console.log(`Threads Auto Follow: [DEBUG] Очищен display name от username: "${displayName}"`);
        }
      }
      
      // Если все еще не нашли username, генерируем случайное имя
      if (!username) {
        username = `user_${Math.random().toString(36).substr(2, 8)}`;
        console.log(`Threads Auto Follow: [DEBUG] Сгенерирован случайный username: "${username}"`);
      }
      
      console.log(`Threads Auto Follow: [DEBUG] Итоговые данные: username="${username}", displayName="${displayName}"`);
      
      return {
        username: username,
        displayName: displayName
      };
    } catch (error) {
      console.error('Ошибка извлечения имени пользователя:', error);
      return {
        username: `user_${Math.random().toString(36).substr(2, 8)}`,
        displayName: null
      };
    }
  }

  extractUserAvatar(button) {
    try {
      // Ищем родительский элемент с информацией о пользователе
      let parent = button.parentElement;
      let avatarUrl = null;
      let foundDefaultAvatar = false;
      
      // Поднимаемся по DOM дереву в поисках аватарки
      for (let i = 0; i < 8 && parent; i++) {
        // Ищем img элементы с аватарками
        const imgElements = parent.querySelectorAll('img');
        
        for (const img of imgElements) {
          const src = img.src;
          const alt = img.alt;
          const dataTestId = img.getAttribute('data-testid');
          const className = img.className || '';
          const classNameString = typeof className === 'string' ? className : className.toString();
          
          // Проверяем, что это аватарка пользователя
          if (src && 
              (src.includes('profile') || 
               src.includes('avatar') || 
               src.includes('user') ||
               src.includes('instagram') ||
               src.includes('fbcdn') ||
               src.includes('scontent') ||
               src.includes('cdninstagram') ||
               (alt && (alt.includes('profile') || alt.includes('avatar'))) ||
               (dataTestId && (dataTestId.includes('avatar') || dataTestId.includes('profile'))) ||
               (classNameString && (classNameString.includes('avatar') || classNameString.includes('profile'))))) {
            
            // Проверяем, что это НЕ дефолтная аватарка
            if (this.isDefaultAvatar(src)) {
              console.log(`Threads Auto Follow: Найдена дефолтная аватарка: ${src}`);
              foundDefaultAvatar = true;
              // Если нашли дефолтную аватарку, сразу возвращаем null
              return null;
            }
            
            // Проверяем размер изображения (аватарки обычно маленькие)
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              if (aspectRatio > 0.8 && aspectRatio < 1.2 && img.naturalWidth <= 200) {
                avatarUrl = src;
                console.log(`Threads Auto Follow: Найдена реальная аватарка: ${src}`);
                break;
              }
            } else {
              // Если размеры не загружены, проверяем по URL
              if (!this.isDefaultAvatar(src)) {
                avatarUrl = src;
                console.log(`Threads Auto Follow: Найдена аватарка (без размеров): ${src}`);
                break;
              }
            }
          }
        }
        
        if (avatarUrl) break;
        parent = parent.parentElement;
      }
      
      // Если не нашли аватарку, проверяем, есть ли вообще img элементы в родительском контейнере
      if (!avatarUrl && !foundDefaultAvatar) {
        // Ищем любые img элементы в родительском контейнере
        let parent = button.parentElement;
        for (let i = 0; i < 8 && parent; i++) {
          const imgElements = parent.querySelectorAll('img');
          if (imgElements.length === 0) {
            // Если нет img элементов вообще, значит у пользователя нет аватарки
            console.log(`Threads Auto Follow: У пользователя нет аватарки (нет img элементов)`);
            return null;
          }
          parent = parent.parentElement;
        }
      }
      
      return avatarUrl;
    } catch (error) {
      console.error('Ошибка извлечения аватарки:', error);
      return null;
    }
  }

  isDefaultAvatar(src) {
    if (!src) return true;
    
    console.log(`Threads Auto Follow: Проверяем аватарку на дефолтность: ${src}`);
    
    // Проверяем на дефолтные аватарки Instagram/Threads
    const defaultPatterns = [
      'anonymous_profile_pic', // Анонимная аватарка
      'default_profile_pic',   // Дефолтная аватарка
      'blank_profile_pic',     // Пустая аватарка
      'no_profile_pic',        // Нет аватарки
      'default-avatar',        // Дефолт аватар
      'placeholder',           // Заглушка
      'empty',                 // Пустая
      'null',                  // Null
      'undefined',             // Undefined
      'data:image/svg',        // SVG заглушки
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Прозрачный PNG
      '1x1',                   // 1x1 пиксель
      'blank',                 // Бланк
      'no-image',              // Нет изображения
      'no-avatar',             // Нет аватарки
      'default-user',          // Дефолтный пользователь
      'user-default',          // Пользователь по умолчанию
      'profile-default',       // Профиль по умолчанию
      'avatar-default',        // Аватар по умолчанию
      'ig_cache_key=YW5vbnltb3VzX3Byb2ZpbGVfcGlj', // Instagram анонимная аватарка
      'anonymous',             // Анонимный
      'default_profile',       // Дефолтный профиль
      'profile_pic_default',   // Дефолтная аватарка профиля
      'default_avatar',        // Дефолтная аватарка
      'no_avatar',             // Нет аватарки
      'empty_avatar',          // Пустая аватарка
      'blank_avatar'           // Пустая аватарка
    ];
    
    const lowerSrc = src.toLowerCase();
    
    // Проверяем паттерны дефолтных аватарок
    for (const pattern of defaultPatterns) {
      if (lowerSrc.includes(pattern)) {
        return true;
      }
    }
    
    // Проверяем на очень короткие URL (обычно дефолтные)
    if (src.length < 50) {
      return true;
    }
    
    // Проверяем на URL с параметрами, указывающими на дефолтную аватарку
    if (lowerSrc.includes('default') || lowerSrc.includes('blank') || lowerSrc.includes('empty') || lowerSrc.includes('anonymous')) {
      return true;
    }
    
    // Проверяем на специфичные для Instagram/Threads дефолтные изображения
    // Обычно они содержат определенные параметры в URL
    if (lowerSrc.includes('ig_cache_key') && lowerSrc.includes('anonymous')) {
      return true;
    }
    
    // Проверяем на URL с параметрами, указывающими на дефолтную аватарку
    if (lowerSrc.includes('stp=dst-jpg') && lowerSrc.includes('efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGlj')) {
      // Это может быть дефолтная аватарка Instagram
      return true;
    }
    
    // Проверяем на специфичные параметры анонимных аватарок
    if (lowerSrc.includes('efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xNTAuYzIifQ')) {
      // Это анонимная аватарка с размером 150x150
      return true;
    }
    
    // Проверяем на конкретный ig_cache_key для анонимных аватарок
    if (lowerSrc.includes('ig_cache_key=yw5vbnltb3vzx3byb2zpbgvfcglj')) {
      return true;
    }
    
    // Проверяем на URL с параметрами, указывающими на анонимную аватарку
    if (lowerSrc.includes('ig_cache_key') && lowerSrc.includes('yw5vbnltb3vz')) {
      console.log(`Threads Auto Follow: Найдена анонимная аватарка по ig_cache_key: ${src}`);
      return true;
    }
    
    console.log(`Threads Auto Follow: Аватарка НЕ является дефолтной: ${src}`);
    return false;
  }

  shouldSubscribeToUser(avatarUrl) {
    const hasAvatar = avatarUrl !== null && avatarUrl !== undefined && avatarUrl.trim() !== '';
    
    console.log(`Threads Auto Follow: [DEBUG] shouldSubscribeToUser called with avatarUrl: ${avatarUrl}`);
    console.log(`Threads Auto Follow: [DEBUG] hasAvatar: ${hasAvatar}`);
    console.log(`Threads Auto Follow: [DEBUG] avatarFilter: ${this.avatarFilter}`);
    
    switch (this.avatarFilter) {
      case 'with-avatar':
        console.log(`Threads Auto Follow: [DEBUG] Filter: with-avatar, returning: ${hasAvatar}`);
        return hasAvatar;
      case 'without-avatar':
        console.log(`Threads Auto Follow: [DEBUG] Filter: without-avatar, returning: ${!hasAvatar}`);
        return !hasAvatar;
      case 'all':
      default:
        console.log(`Threads Auto Follow: [DEBUG] Filter: all, returning: true`);
        return true;
    }
  }

  shouldSubscribeToUserByOnlineStatus(buttonElement) {
    console.log(`Threads Auto Follow: [DEBUG] shouldSubscribeToUserByOnlineStatus called`);
    console.log(`Threads Auto Follow: [DEBUG] onlineFilter: ${this.onlineFilter}`);
    
    // Если фильтр "все", пропускаем проверку
    if (this.onlineFilter === 'all') {
      console.log(`Threads Auto Follow: [DEBUG] Filter: all, returning: true`);
      return true;
    }
    
    // Проверяем онлайн статус пользователя
    const isOnline = this.checkUserOnlineStatusFromButton(buttonElement);
    console.log(`Threads Auto Follow: [DEBUG] isOnline: ${isOnline}`);
    
    switch (this.onlineFilter) {
      case 'online-only':
        console.log(`Threads Auto Follow: [DEBUG] Filter: online-only, returning: ${isOnline}`);
        return isOnline;
      case 'offline-only':
        console.log(`Threads Auto Follow: [DEBUG] Filter: offline-only, returning: ${!isOnline}`);
        return !isOnline;
      case 'all':
      default:
        console.log(`Threads Auto Follow: [DEBUG] Filter: all, returning: true`);
        return true;
    }
  }

  checkUserOnlineStatusFromButton(buttonElement) {
    console.log(`Threads Auto Follow: [DEBUG] checkUserOnlineStatusFromButton called`);
    
    try {
      // Ищем контейнер пользователя, поднимаясь по DOM
      let container = buttonElement;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (container && attempts < maxAttempts) {
        // Проверяем, содержит ли контейнер аватарку и текст пользователя
        const hasAvatar = container.querySelector('img');
        const hasUserText = container.textContent && container.textContent.trim().length > 0;
        
        if (hasAvatar && hasUserText) {
          console.log(`Threads Auto Follow: [DEBUG] Найден контейнер пользователя на уровне ${attempts}`);
          
          // Ищем индикаторы онлайн статуса в этом контейнере
          const onlineIndicators = this.findOnlineIndicatorsInContainer(container);
          
          console.log(`Threads Auto Follow: [DEBUG] Найдено индикаторов онлайн: ${onlineIndicators.greenDots.length} зеленых точек, ${onlineIndicators.statusElements.length} элементов статуса, ${onlineIndicators.statusText.length} текстов статуса`);
          
          // Дополнительная отладочная информация
          if (onlineIndicators.greenDots.length > 0) {
            console.log(`Threads Auto Follow: [DEBUG] Зеленые точки:`, onlineIndicators.greenDots);
          }
          if (onlineIndicators.statusElements.length > 0) {
            console.log(`Threads Auto Follow: [DEBUG] Элементы статуса:`, onlineIndicators.statusElements);
          }
          if (onlineIndicators.statusText.length > 0) {
            console.log(`Threads Auto Follow: [DEBUG] Тексты статуса:`, onlineIndicators.statusText);
          }
          
          return onlineIndicators.hasOnlineIndicator;
        }
        
        container = container.parentElement;
        attempts++;
      }
      
      console.log(`Threads Auto Follow: [DEBUG] Контейнер пользователя не найден`);
      return false;
      
    } catch (error) {
      console.error(`Threads Auto Follow: [ERROR] Ошибка при проверке онлайн статуса:`, error);
      return false;
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
        // Запоминаем текущую позицию прокрутки и количество кнопок
        const oldScrollTop = scrollableContainer.scrollTop;
        const oldScrollHeight = scrollableContainer.scrollHeight;
        const oldButtonCount = this.findSubscribeButtons().length;
        
        console.log(`Threads Auto Follow: [SCROLL] До прокрутки: scrollTop=${oldScrollTop}, scrollHeight=${oldScrollHeight}, buttons=${oldButtonCount}`);
        
        // Более агрессивная прокрутка
        const currentScrollTop = scrollableContainer.scrollTop;
        const targetScrollTop = currentScrollTop + 800; // Увеличиваем шаг прокрутки
        
        scrollableContainer.scrollTop = targetScrollTop;
        
        // Ждем дольше для загрузки контента
        await this.sleep(2000);
        
        // Проверяем, изменилась ли позиция прокрутки
        const newScrollTop = scrollableContainer.scrollTop;
        const newScrollHeight = scrollableContainer.scrollHeight;
        
        console.log(`Threads Auto Follow: [SCROLL] После прокрутки: scrollTop=${newScrollTop}, scrollHeight=${newScrollHeight}`);
        
        // Проверяем, что мы действительно прокрутили вниз (не вернулись вверх)
        const scrolled = newScrollTop > oldScrollTop || newScrollHeight > oldScrollHeight;
        
        if (scrolled) {
          console.log('Threads Auto Follow: Успешно прокрутили вниз для загрузки новых пользователей');
          console.log(`Threads Auto Follow: [SCROLL] Изменение: scrollTop ${oldScrollTop} -> ${newScrollTop}, scrollHeight ${oldScrollHeight} -> ${newScrollHeight}`);
        } else {
          console.log('Threads Auto Follow: Не удалось прокрутить, возможно достигнут конец списка');
          console.log(`Threads Auto Follow: [SCROLL] Нет изменений в прокрутке`);
        }
        
        return scrolled;
      }
    }
    
    console.log('Threads Auto Follow: Не найден прокручиваемый контейнер');
    return false;
  }

  showHistoryModal() {
    // Удаляем старое модальное окно если есть
    const existingModal = document.getElementById('threads-history-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Получаем текущую тему из popup
    const getCurrentTheme = () => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['theme'], (result) => {
          resolve(result.theme || 'dark');
        });
      });
    };

    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.id = 'threads-history-modal';
    
    // Применяем тему к модальному окну
    getCurrentTheme().then(theme => {
      modal.innerHTML = `
        <div class="threads-modal-overlay ${theme === 'light' ? 'light-theme' : ''}">
          <div class="threads-modal-content ${theme === 'light' ? 'light-theme' : ''}">
            <div class="threads-modal-header ${theme === 'light' ? 'light-theme' : ''}">
              <h3>📋 История подписок</h3>
              <button class="threads-modal-close ${theme === 'light' ? 'light-theme' : ''}">&times;</button>
            </div>
            <div class="threads-modal-body ${theme === 'light' ? 'light-theme' : ''}">
            <div id="threads-history-stats" class="threads-history-stats ${theme === 'light' ? 'light-theme' : ''}" style="display: none;">
              <div class="threads-stat-item ${theme === 'light' ? 'light-theme' : ''}">
                <span id="threads-total-subscriptions" class="threads-stat-number ${theme === 'light' ? 'light-theme' : ''}">0</span>
                <div class="threads-stat-label ${theme === 'light' ? 'light-theme' : ''}">Всего подписок</div>
              </div>
              <div class="threads-stat-item ${theme === 'light' ? 'light-theme' : ''}">
                <span id="threads-today-subscriptions" class="threads-stat-number ${theme === 'light' ? 'light-theme' : ''}">0</span>
                <div class="threads-stat-label ${theme === 'light' ? 'light-theme' : ''}">Сегодня</div>
              </div>
              <div class="threads-stat-item ${theme === 'light' ? 'light-theme' : ''}">
                <span id="threads-week-subscriptions" class="threads-stat-number ${theme === 'light' ? 'light-theme' : ''}">0</span>
                <div class="threads-stat-label ${theme === 'light' ? 'light-theme' : ''}">За неделю</div>
              </div>
            </div>
            
            <div id="threads-history-list" class="threads-history-list ${theme === 'light' ? 'light-theme' : ''}">
              <div class="threads-loading ${theme === 'light' ? 'light-theme' : ''}">Загрузка истории...</div>
            </div>
            
            <div class="threads-modal-controls">
              <button id="threads-clear-history-btn" class="threads-btn threads-btn-secondary ${theme === 'light' ? 'light-theme' : ''}">
                🗑️ Очистить историю
              </button>
              <button id="threads-export-history-btn" class="threads-btn threads-btn-secondary ${theme === 'light' ? 'light-theme' : ''}">
                📤 Экспорт CSV
              </button>
              <button id="threads-refresh-history-btn" class="threads-btn threads-btn-primary ${theme === 'light' ? 'light-theme' : ''}">
                🔄 Обновить
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

      // Добавляем стили
      this.addHistoryModalStyles();

      // Добавляем обработчики событий
      this.bindHistoryModalEvents(modal);

      // Добавляем модальное окно на страницу
      document.body.appendChild(modal);

      // Загружаем историю
      this.loadHistoryData();
    });
  }

  addHistoryModalStyles() {
    // Проверяем, не добавлены ли уже стили
    if (document.getElementById('threads-history-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'threads-history-styles';
    styles.textContent = `
      .threads-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        animation: threadsModalFadeIn 0.3s ease-out;
      }

      @keyframes threadsModalFadeIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .threads-modal-content {
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        border-radius: 20px;
        width: 95%;
        max-width: 900px;
        max-height: 90%;
        border: 2px solid #333333;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        animation: threadsModalSlideIn 0.3s ease-out;
      }

      @keyframes threadsModalSlideIn {
        from {
          transform: translateY(-50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .threads-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px;
        border-bottom: 2px solid #333333;
        background: linear-gradient(90deg, #2a2a2a 0%, #1a1a1a 100%);
      }

      .threads-modal-header h3 {
        color: #ffffff;
        font-size: 22px;
        margin: 0;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
      }


      .threads-modal-close {
        background: #333333;
        border: none;
        color: #a8a8a8;
        font-size: 20px;
        cursor: pointer;
        padding: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .threads-modal-close:hover {
        color: #ffffff;
        background: #444444;
        transform: scale(1.1);
      }

      .threads-modal-body {
        padding: 30px;
        max-height: 600px;
        overflow-y: auto;
      }

      .threads-modal-body::-webkit-scrollbar {
        width: 8px;
      }

      .threads-modal-body::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 4px;
      }

      .threads-modal-body::-webkit-scrollbar-thumb {
        background: #444444;
        border-radius: 4px;
      }

      .threads-modal-body::-webkit-scrollbar-thumb:hover {
        background: #555555;
      }

      .threads-history-stats {
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 25px;
        border: 1px solid #333333;
        display: flex;
        justify-content: space-around;
        text-align: center;
      }

      .threads-stat-item {
        color: #ffffff;
      }

      .threads-stat-number {
        font-size: 32px;
        font-weight: 700;
        color: #ffffff;
        display: block;
      }

      .threads-stat-label {
        font-size: 14px;
        color: #a8a8a8;
        margin-top: 8px;
      }

      .threads-history-list {
        max-height: 450px;
        overflow-y: auto;
        margin-bottom: 25px;
      }

      .threads-history-list::-webkit-scrollbar {
        width: 6px;
      }

      .threads-history-list::-webkit-scrollbar-track {
        background: #2a2a2a;
        border-radius: 3px;
      }

      .threads-history-list::-webkit-scrollbar-thumb {
        background: #555555;
        border-radius: 3px;
      }

      .threads-history-item {
        background: linear-gradient(135deg, #2a2a2a 0%, #333333 100%);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        border: 1px solid #444444;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .threads-history-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(180deg, #ffffff 0%, #a8a8a8 100%);
      }

      .threads-history-avatar {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid #444444;
        background: #333333;
      }

      .threads-history-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .threads-history-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        border-color: #555555;
      }

      .threads-history-content {
        flex: 1;
        min-width: 0;
      }

      .threads-history-username {
        margin-bottom: 8px;
      }

      .threads-username-link {
        color: #ffffff;
        font-weight: 600;
        font-size: 16px;
        text-decoration: none;
        transition: color 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .threads-username-link::before {
        content: '👤';
        font-size: 16px;
      }

      .threads-username-link:hover {
        color: #ffffff;
        text-decoration: underline;
      }

      .threads-history-date {
        color: #a8a8a8;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .threads-history-date::before {
        content: '🕒';
        font-size: 14px;
      }

      .threads-history-actions {
        flex-shrink: 0;
        display: flex;
        gap: 8px;
      }

      .threads-action-btn {
        background: #333333;
        border: 1px solid #444444;
        color: #ffffff;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.2s ease;
      }

      .threads-action-btn:hover {
        background: #444444;
        border-color: #555555;
        transform: scale(1.1);
      }

      /* Стили для таблицы */
      .threads-history-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        background: #1a1a1a;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #333333;
      }

      .threads-history-table th {
        background: #2a2a2a;
        color: #ffffff;
        padding: 12px 8px;
        text-align: left;
        font-weight: 600;
        font-size: 12px;
        border-bottom: 2px solid #333333;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .threads-history-table td {
        padding: 10px 8px;
        border-bottom: 1px solid #333333;
        color: #ffffff;
        font-size: 11px;
        vertical-align: top;
      }

      .threads-history-table tr:hover {
        background: #2a2a2a;
      }

      .threads-table-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }

      .threads-table-username {
        font-weight: 600;
        color: #ffffff;
      }

      .threads-table-displayname {
        color: #a8a8a8;
        font-size: 10px;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .threads-table-badges {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .threads-table-badge {
        background: #333333;
        color: #ffffff;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 9px;
        border: 1px solid #444444;
      }

      .threads-table-actions {
        display: flex;
        gap: 4px;
      }

      .threads-table-action-btn {
        background: #333333;
        border: 1px solid #444444;
        border-radius: 4px;
        padding: 4px 6px;
        color: #ffffff;
        cursor: pointer;
        font-size: 10px;
        transition: all 0.2s ease;
      }

      .threads-table-action-btn:hover {
        background: #444444;
        border-color: #555555;
      }

      .threads-loading {
        text-align: center;
        color: #a8a8a8;
        font-size: 16px;
        padding: 40px 20px;
      }

      .threads-loading::before {
        content: '⏳';
        display: block;
        font-size: 32px;
        margin-bottom: 12px;
        animation: threadsSpin 2s linear infinite;
      }

      @keyframes threadsSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .threads-history-empty {
        text-align: center;
        color: #a8a8a8;
        font-size: 16px;
        padding: 60px 20px;
        background: linear-gradient(135deg, #2a2a2a 0%, #333333 100%);
        border-radius: 12px;
        border: 2px dashed #444444;
      }

      .threads-history-empty::before {
        content: '📭';
        display: block;
        font-size: 48px;
        margin-bottom: 16px;
      }

      .threads-modal-controls {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }

      .threads-btn {
        flex: 1;
        padding: 15px 20px;
        border: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .threads-btn-secondary {
        background: #1a1a1a;
        color: #ffffff;
        border: 1px solid #333333;
      }

      .threads-btn-secondary:hover {
        background: #2a2a2a;
        border-color: #444444;
        transform: translateY(-1px);
      }

      .threads-btn-primary {
        background: #ffffff;
        color: #000000;
      }

      .threads-btn-primary:hover {
        background: #f0f0f0;
        transform: translateY(-1px);
      }

      /* ===== СВЕТЛАЯ ТЕМА ДЛЯ МОДАЛЬНОГО ОКНА ===== */
      
      /* Основные элементы */
      .threads-modal-overlay.light-theme {
        background: rgba(255, 255, 255, 0.9);
      }

      .threads-modal-content.light-theme {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-color: #dee2e6;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      }

      .threads-modal-header.light-theme {
        background: linear-gradient(90deg, #e9ecef 0%, #f8f9fa 100%);
        border-bottom-color: #dee2e6;
      }

      .threads-modal-header.light-theme h3 {
        color: #000000;
      }

      .threads-modal-close.light-theme {
        background: #e9ecef;
        color: #6c757d;
      }

      .threads-modal-close.light-theme:hover {
        color: #000000;
        background: #dee2e6;
      }

      /* Статистика */
      .threads-history-stats.light-theme {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-color: #dee2e6;
      }

      .threads-stat-item.light-theme {
        color: #000000;
      }

      .threads-stat-number.light-theme {
        color: #000000;
      }

      .threads-stat-label.light-theme {
        color: #6c757d;
      }

      /* Список истории */
      .threads-history-list.light-theme::-webkit-scrollbar-track {
        background: #e9ecef;
      }

      .threads-history-list.light-theme::-webkit-scrollbar-thumb {
        background: #adb5bd;
      }

      .threads-history-item.light-theme {
        background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
        border-color: #dee2e6;
      }

      .threads-history-item.light-theme::before {
        background: linear-gradient(180deg, #007bff 0%, #0056b3 100%);
      }

      .threads-history-item.light-theme:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: #adb5bd;
      }

      .threads-history-avatar.light-theme {
        border-color: #dee2e6;
        background: #f8f9fa;
      }

      .threads-username-link.light-theme {
        color: #000000;
      }

      .threads-username-link.light-theme:hover {
        color: #007bff;
      }

      .threads-history-date.light-theme {
        color: #6c757d;
      }

      .threads-action-btn.light-theme {
        background: #e9ecef;
        border-color: #dee2e6;
        color: #000000;
      }

      .threads-action-btn.light-theme:hover {
        background: #dee2e6;
        border-color: #adb5bd;
      }


      .threads-history-table.light-theme {
        background: #ffffff;
        border-color: #dee2e6;
      }

      .threads-history-table.light-theme th {
        background: #f8f9fa;
        color: #000000;
        border-bottom-color: #dee2e6;
      }

      .threads-history-table.light-theme td {
        color: #000000;
        border-bottom-color: #dee2e6;
      }

      .threads-history-table.light-theme tr:hover {
        background: #f8f9fa;
      }

      .threads-table-username.light-theme {
        color: #000000;
      }

      .threads-table-displayname.light-theme {
        color: #6c757d;
      }

      .threads-table-badge.light-theme {
        background: #e9ecef;
        color: #000000;
        border-color: #dee2e6;
      }

      .threads-table-action-btn.light-theme {
        background: #e9ecef;
        border-color: #dee2e6;
        color: #000000;
      }

      .threads-table-action-btn.light-theme:hover {
        background: #dee2e6;
        border-color: #adb5bd;
      }

      /* Загрузка и пустое состояние */
      .threads-loading.light-theme {
        color: #6c757d;
      }

      .threads-history-empty.light-theme {
        color: #6c757d;
        background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
        border-color: #dee2e6;
      }

      /* Кнопки */
      .threads-btn-secondary.light-theme {
        background: #f8f9fa;
        color: #000000;
        border-color: #dee2e6;
      }

      .threads-btn-secondary.light-theme:hover {
        background: #e9ecef;
        border-color: #adb5bd;
      }

      .threads-btn-primary.light-theme {
        background: #007bff;
        color: #ffffff;
      }

      .threads-btn-primary.light-theme:hover {
        background: #0056b3;
      }

      /* Скроллбар */
      .threads-modal-body.light-theme::-webkit-scrollbar-track {
        background: #f8f9fa;
      }

      .threads-modal-body.light-theme::-webkit-scrollbar-thumb {
        background: #adb5bd;
      }

      .threads-modal-body.light-theme::-webkit-scrollbar-thumb:hover {
        background: #6c757d;
      }
    `;

    document.head.appendChild(styles);
  }

  bindHistoryModalEvents(modal) {
    const closeBtn = modal.querySelector('.threads-modal-close');
    const overlay = modal.querySelector('.threads-modal-overlay');
    const clearBtn = modal.querySelector('#threads-clear-history-btn');
    const exportBtn = modal.querySelector('#threads-export-history-btn');
    const refreshBtn = modal.querySelector('#threads-refresh-history-btn');

    closeBtn.addEventListener('click', () => this.hideHistoryModal());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hideHistoryModal();
      }
    });
    clearBtn.addEventListener('click', () => this.clearHistoryData());
    exportBtn.addEventListener('click', () => this.exportHistoryData());
    refreshBtn.addEventListener('click', () => this.loadHistoryData());
  }

  hideHistoryModal() {
    const modal = document.getElementById('threads-history-modal');
    if (modal) {
      modal.remove();
    }
  }


  async loadHistoryData() {
    try {
      const result = await chrome.storage.local.get(['subscriptionHistory', 'theme']);
      const history = result.subscriptionHistory || [];
      const theme = result.theme || 'dark';
      
      const historyList = document.getElementById('threads-history-list');
      const historyStats = document.getElementById('threads-history-stats');
      
      if (history.length === 0) {
        historyList.innerHTML = `<div class="threads-history-empty ${theme === 'light' ? 'light-theme' : ''}">История подписок пуста</div>`;
        historyStats.style.display = 'none';
        return;
      }

      // Показываем статистику
      historyStats.style.display = 'flex';
      this.updateHistoryStats(history);

      // Сортируем по дате (новые сверху)
      history.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Всегда показываем только таблицу
      historyList.innerHTML = this.generateTableView(history, theme);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  }

  generateTableView(history, theme) {
    if (history.length === 0) {
      return `<div class="threads-history-empty ${theme === 'light' ? 'light-theme' : ''}">История подписок пуста</div>`;
    }

    return `
      <table class="threads-history-table ${theme === 'light' ? 'light-theme' : ''}">
        <thead>
          <tr>
            <th>Аватарка</th>
            <th>Username</th>
            <th>Display Name</th>
            <th>Дата/Время</th>
            <th>Язык</th>
          </tr>
        </thead>
        <tbody>
          ${history.map(item => {
            // Определяем URL аватарки
            let avatarSrc;
            if (item.avatarUrl) {
              avatarSrc = item.avatarUrl;
            } else {
              avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username)}&background=333333&color=ffffff&size=32&rounded=true`;
            }
            
            const displayName = item.displayName || '';
            const hasAvatar = item.userData?.hasAvatar ? 'Yes' : 'No';
            const nameLanguage = item.userData?.nameLanguage || 'unknown';
            const filters = item.filters || {};
            const displayNameLength = item.userData?.displayNameLength || 0;
            const usernameLength = item.userData?.usernameLength || 0;
            const profileUrl = item.userData?.profileUrl || `https://www.threads.net/@${item.username}`;
            
            return `
              <tr>
                <td>
                  <img src="${avatarSrc}" 
                       alt="${item.username}" 
                       class="threads-table-avatar ${theme === 'light' ? 'light-theme' : ''}"
                       onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMzMzMzMzMiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggOEM5LjEwNDU3IDggMTAgNi44OTU0MyAxMCA1LjVDMTAgNC4xMDQ1NyA5LjEwNDU3IDMgOCAzQzYuODk1NDMgMyA2IDQuMTA0NTcgNiA1LjVDNiA2Ljg5NTQzIDYuODk1NDMgOCA4IDhaIiBmaWxsPSIjNjY2NjY2Ii8+CjxwYXRoIGQ9Ik04IDEwQzYuMzM5IDkgNSA5LjY2NyA1IDExSDEzQzEzIDkuNjY3IDExLjY2MSA5IDEwIDlIOFo4WiIgZmlsbD0iIzY2NjY2NiIvPgo8L3N2Zz4KPC9zdmc+Cg=='">
                </td>
                <td>
                  <div class="threads-table-username ${theme === 'light' ? 'light-theme' : ''}">
                    <a href="${profileUrl}" target="_blank" title="Открыть профиль">
                      @${item.username}
                    </a>
                  </div>
                </td>
                <td>
                  <div class="threads-table-displayname ${theme === 'light' ? 'light-theme' : ''}" title="${displayName}">
                    ${displayName}
                  </div>
                </td>
                <td>${new Date(item.date).toLocaleString('ru-RU')}</td>
                <td>
                  <span class="threads-table-badge ${theme === 'light' ? 'light-theme' : ''}">
                    ${nameLanguage === 'cyrillic' ? '🇷🇺 Кириллица' : nameLanguage === 'latin' ? '🇺🇸 Латиница' : '🌐 Смешанный'}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  updateHistoryStats(history) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalSubscriptions = history.length;
    const todaySubscriptions = history.filter(item => new Date(item.date) >= today).length;
    const weekSubscriptions = history.filter(item => new Date(item.date) >= weekAgo).length;

    document.getElementById('threads-total-subscriptions').textContent = totalSubscriptions;
    document.getElementById('threads-today-subscriptions').textContent = todaySubscriptions;
    document.getElementById('threads-week-subscriptions').textContent = weekSubscriptions;
  }

  async clearHistoryData() {
    if (confirm('Вы уверены, что хотите очистить историю подписок?')) {
      try {
        await chrome.storage.local.remove(['subscriptionHistory']);
        this.loadHistoryData();
        this.showNotification('История подписок очищена', 'success');
      } catch (error) {
        console.error('Ошибка очистки истории:', error);
        this.showNotification('Ошибка очистки истории', 'error');
      }
    }
  }

  async exportHistoryData() {
    try {
      const result = await chrome.storage.local.get(['subscriptionHistory']);
      const history = result.subscriptionHistory || [];
      
      if (history.length === 0) {
        this.showNotification('История подписок пуста', 'error');
        return;
      }

      // Создаем CSV контент с основными данными
      const csvContent = [
        'Username,Display Name,Date,Time,Name Language,Profile URL',
        ...history.map(item => {
          const date = new Date(item.date);
          const displayName = (item.displayName || '').replace(/"/g, '""'); // Экранируем кавычки
          const nameLanguage = item.userData?.nameLanguage || 'unknown';
          const profileUrl = item.userData?.profileUrl || `https://www.threads.net/@${item.username}`;
          
          return `@${item.username},"${displayName}","${date.toLocaleDateString('ru-RU')}","${date.toLocaleTimeString('ru-RU')}",${nameLanguage},"${profileUrl}"`;
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
      
      this.showNotification('История экспортирована в CSV файл', 'success');
    } catch (error) {
      console.error('Ошибка экспорта истории:', error);
      this.showNotification('Ошибка экспорта истории', 'error');
    }
  }

  scanDOM() {
    console.log('Threads Auto Follow: Начинаем сканирование DOM...');
    
    // Ищем модальное окно
    const modal = document.querySelector('[role="dialog"]') ||
                  document.querySelector('.modal') ||
                  document.querySelector('[data-testid="modal"]') ||
                  document.querySelector('[aria-modal="true"]') ||
                  document.querySelector('[data-testid="followers-modal"]') ||
                  document.querySelector('[data-testid="following-modal"]');

    console.log('Threads Auto Follow: Найдено модальное окно:', modal);

    if (modal) {
      // Сканируем все элементы в модальном окне
      const allElements = modal.querySelectorAll('*');
      console.log(`Threads Auto Follow: Всего элементов в модальном окне: ${allElements.length}`);

      // Ищем кнопки подписки
      const subscribeButtons = [];
      const allButtons = modal.querySelectorAll('button, div');
      
      allButtons.forEach((element, index) => {
        const text = element.textContent.trim();
        // Универсальная поддержка разных языков интерфейса
        const subscribeButtonTexts = this.getSubscribeButtonTexts();
        const isSubscribeButton = subscribeButtonTexts.includes(text) || 
                                 subscribeButtonTexts.some(btnText => text.includes(btnText));
        
        if (isSubscribeButton) {
          subscribeButtons.push({
            element: element,
            text: text,
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            role: element.getAttribute('role'),
            tabindex: element.getAttribute('tabindex'),
            index: index
          });
        }
      });

      console.log(`Threads Auto Follow: Найдено кнопок подписки: ${subscribeButtons.length}`);
      
      // Выводим детальную информацию только о первых 5 кнопках
      subscribeButtons.slice(0, 5).forEach((button, index) => {
        console.log(`Threads Auto Follow: Кнопка ${index + 1}:`, {
          text: button.text,
          tagName: button.tagName,
          className: button.className,
          id: button.id,
          role: button.role,
          tabindex: button.tabindex,
          element: button.element
        });
      });
      
      if (subscribeButtons.length > 5) {
        console.log(`Threads Auto Follow: ... и еще ${subscribeButtons.length - 5} кнопок`);
      }

      // Ищем прокручиваемые контейнеры
      const scrollableContainers = modal.querySelectorAll('[style*="overflow"], [style*="scroll"], div[style*="height"]');
      console.log(`Threads Auto Follow: Найдено прокручиваемых контейнеров: ${scrollableContainers.length}`);
      
      // Выводим информацию только о первых 3 контейнерах
      scrollableContainers.slice(0, 3).forEach((container, index) => {
        console.log(`Threads Auto Follow: Прокручиваемый контейнер ${index + 1}:`, {
          tagName: container.tagName,
          className: container.className,
          style: container.style.cssText,
          scrollTop: container.scrollTop,
          scrollHeight: container.scrollHeight,
          clientHeight: container.clientHeight,
          element: container
        });
      });
      
      if (scrollableContainers.length > 3) {
        console.log(`Threads Auto Follow: ... и еще ${scrollableContainers.length - 3} контейнеров`);
      }

      // Ищем изображения (аватарки)
      const images = modal.querySelectorAll('img');
      console.log(`Threads Auto Follow: Найдено изображений: ${images.length}`);
      
      // Выводим информацию только о первых 5 изображениях
      images.slice(0, 5).forEach((img, index) => {
        console.log(`Threads Auto Follow: Изображение ${index + 1}:`, {
          src: img.src,
          alt: img.alt,
          className: img.className,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          element: img
        });
      });
      
      if (images.length > 5) {
        console.log(`Threads Auto Follow: ... и еще ${images.length - 5} изображений`);
      }

      // Ищем текстовые элементы (имена пользователей)
      const textElements = modal.querySelectorAll('span, div, a, h1, h2, h3');
      const potentialUsernames = [];
      
      textElements.forEach((element, index) => {
        const text = element.textContent.trim();
        const excludedTexts = this.getExcludedTexts();
        const isExcluded = excludedTexts.some(excludedText => text.includes(excludedText));
        
        if (text && 
            !isExcluded &&
            text.length > 2 && 
            text.length < 50 &&
            !text.includes(' ') &&
            /^[a-zA-Z0-9._]+$/.test(text)) {
          potentialUsernames.push({
            text: text,
            tagName: element.tagName,
            className: element.className,
            element: element
          });
        }
      });

      console.log(`Threads Auto Follow: Найдено потенциальных имен пользователей: ${potentialUsernames.length}`);
      
      // Выводим информацию только о первых 10 именах
      potentialUsernames.slice(0, 10).forEach((username, index) => {
        console.log(`Threads Auto Follow: Имя пользователя ${index + 1}:`, username);
      });
      
      if (potentialUsernames.length > 10) {
        console.log(`Threads Auto Follow: ... и еще ${potentialUsernames.length - 10} имен`);
      }

      this.showNotification(`Сканирование завершено! Найдено: ${subscribeButtons.length} кнопок, ${scrollableContainers.length} контейнеров, ${images.length} изображений, ${potentialUsernames.length} имен`, 'info');
      
      // Детальный анализ первых 3 пользователей
      console.log('\n🔍 === ДЕТАЛЬНЫЙ АНАЛИЗ ПОЛЬЗОВАТЕЛЕЙ ===');
      subscribeButtons.slice(0, 3).forEach((button, index) => {
        console.log(`\n=== ПОЛЬЗОВАТЕЛЬ ${index + 1} ===`);
        this.analyzeUserData(button.element);
      });
      
    } else {
      console.log('Threads Auto Follow: Модальное окно не найдено');
      this.showNotification('Модальное окно не найдено. Откройте список подписчиков/подписок', 'error');
    }
  }

  // Новая функция для детального анализа данных пользователя
  analyzeUserData(buttonElement) {
    try {
      console.log('🔍 Анализ данных пользователя:');
      
      // Ищем родительский контейнер пользователя
      let userContainer = buttonElement.parentElement;
      let attempts = 0;
      
      // Поднимаемся по DOM дереву, пока не найдем контейнер с полной информацией о пользователе
      while (userContainer && attempts < 10) {
        const containerText = userContainer.textContent || '';
        
        // Ищем контейнер, который содержит и имя пользователя, и кнопку подписки
        if (containerText.length > 50 && containerText.length < 500) {
          break;
        }
        
        userContainer = userContainer.parentElement;
        attempts++;
      }
      
      if (!userContainer) {
        console.log('❌ Не удалось найти контейнер пользователя');
        return;
      }
      
      console.log('📦 Контейнер пользователя:', {
        tagName: userContainer.tagName,
        className: userContainer.className,
        id: userContainer.id,
        textLength: userContainer.textContent.length
      });
      
      // Извлекаем все возможные данные
      const userData = this.extractAllUserData(userContainer);
      
      console.log('👤 Основная информация:', {
        username: userData.username,
        displayName: userData.displayName,
        fullName: userData.fullName,
        bio: userData.bio
      });
      
      console.log('🖼️ Аватарка:', {
        hasAvatar: userData.hasAvatar,
        avatarUrl: userData.avatarUrl,
        isDefaultAvatar: userData.isDefaultAvatar,
        avatarSize: userData.avatarSize
      });
      
      console.log('📊 Статистика:', {
        followers: userData.followers,
        following: userData.following,
        posts: userData.posts
      });
      
      console.log('🏷️ Метаданные:', {
        verified: userData.verified,
        private: userData.private,
        business: userData.business,
        location: userData.location,
        website: userData.website
      });
      
      console.log('🔗 Ссылки:', {
        profileUrl: userData.profileUrl,
        avatarElement: userData.avatarElement ? 'найден' : 'не найден',
        followButton: userData.followButton ? 'найден' : 'не найден'
      });
      
      console.log('📝 Дополнительный текст:', {
        allText: userData.allText.substring(0, 200) + '...',
        textElements: userData.textElements.length
      });
      
    } catch (error) {
      console.error('Ошибка анализа данных пользователя:', error);
    }
  }

  // Функция для извлечения всех возможных данных о пользователе
  extractAllUserData(container) {
    const data = {
      username: null,
      displayName: null,
      fullName: null,
      bio: null,
      hasAvatar: false,
      avatarUrl: null,
      isDefaultAvatar: false,
      avatarSize: null,
      followers: null,
      following: null,
      posts: null,
      verified: false,
      private: false,
      business: false,
      location: null,
      website: null,
      profileUrl: null,
      avatarElement: null,
      followButton: null,
      allText: '',
      textElements: []
    };
    
    try {
      // Собираем весь текст
      data.allText = container.textContent || '';
      
      // Ищем все текстовые элементы
      const textElements = container.querySelectorAll('span, div, a, h1, h2, h3, p');
      data.textElements = Array.from(textElements).map(el => ({
        tagName: el.tagName,
        text: el.textContent.trim(),
        className: el.className,
        id: el.id
      }));
      
      // Ищем аватарку
      const avatarImg = container.querySelector('img');
      if (avatarImg) {
        data.avatarElement = avatarImg;
        data.avatarUrl = avatarImg.src;
        data.hasAvatar = true;
        data.isDefaultAvatar = this.isDefaultAvatar(avatarImg.src);
        data.avatarSize = {
          width: avatarImg.naturalWidth || avatarImg.width,
          height: avatarImg.naturalHeight || avatarImg.height
        };
      }
      
      // Ищем кнопку подписки
      const followBtn = container.querySelector('button, div[role="button"]');
      if (followBtn) {
        data.followButton = followBtn;
      }
      
      // Ищем ссылку на профиль
      const profileLink = container.querySelector('a[href*="/@"]');
      if (profileLink) {
        data.profileUrl = profileLink.href;
      }
      
      // Анализируем текст для извлечения информации
      const text = data.allText;
      
      // Ищем username (обычно начинается с @)
      const usernameMatch = text.match(/@([a-zA-Z0-9._]+)/);
      if (usernameMatch) {
        data.username = usernameMatch[1];
      }
      
      // Ищем статистику (followers, following, posts)
      const followersMatch = text.match(/(\d+)\s*(followers?|подписчиков?)/i);
      if (followersMatch) {
        data.followers = parseInt(followersMatch[1]);
      }
      
      const followingMatch = text.match(/(\d+)\s*(following|подписок?)/i);
      if (followingMatch) {
        data.following = parseInt(followingMatch[1]);
      }
      
      const postsMatch = text.match(/(\d+)\s*(posts?|постов?)/i);
      if (postsMatch) {
        data.posts = parseInt(postsMatch[1]);
      }
      
      // Ищем верификацию
      data.verified = text.includes('✓') || text.includes('verified') || text.includes('верифицирован');
      
      // Ищем приватность
      data.private = text.includes('private') || text.includes('приватный');
      
      // Ищем бизнес-аккаунт
      data.business = text.includes('business') || text.includes('бизнес');
      
      // Ищем локацию
      const locationMatch = text.match(/📍\s*([^•\n]+)/);
      if (locationMatch) {
        data.location = locationMatch[1].trim();
      }
      
      // Ищем веб-сайт
      const websiteMatch = text.match(/🌐\s*([^•\n]+)/);
      if (websiteMatch) {
        data.website = websiteMatch[1].trim();
      }
      
    } catch (error) {
      console.error('Ошибка извлечения данных:', error);
    }
    
    return data;
  }

  // Функция для анализа конкретного пользователя (можно вызвать из консоли)
  analyzeSpecificUser(username) {
    console.log(`🔍 Анализ пользователя: ${username}`);
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('❌ Модальное окно не найдено');
      return;
    }
    
    // Ищем все элементы, содержащие точное совпадение username
    const userElements = modal.querySelectorAll('*');
    let foundUser = null;
    
    userElements.forEach(element => {
      const text = element.textContent || '';
      
      // Ищем точное совпадение username (не как часть другого слова)
      const usernameRegex = new RegExp(`\\b${username}\\b`, 'i');
      if (usernameRegex.test(text)) {
        console.log(`🎯 Найден элемент с username "${username}":`, {
          tagName: element.tagName,
          className: element.className,
          text: text.substring(0, 100) + '...'
        });
        
        // Ищем родительский контейнер с полной информацией
        let container = element.parentElement;
        let attempts = 0;
        
        while (container && attempts < 15) {
          const containerText = container.textContent || '';
          
          // Ищем контейнер, который содержит только одного пользователя
          // Проверяем, что в контейнере есть username и кнопка подписки
          const hasUsername = usernameRegex.test(containerText);
          const hasFollowButton = container.querySelector('button, div[role="button"]');
          const hasAvatar = container.querySelector('img');
          
          // Проверяем, что контейнер не слишком большой (не содержит много пользователей)
          const userCount = (containerText.match(/Following|Follow/g) || []).length;
          
          // Более строгие критерии для размера контейнера
          if (hasUsername && hasFollowButton && hasAvatar && 
              userCount <= 2 && 
              containerText.length > 20 && 
              containerText.length < 200) {
            foundUser = container;
            console.log(`✅ Найден подходящий контейнер:`, {
              tagName: container.tagName,
              className: container.className,
              textLength: containerText.length,
              userCount: userCount
            });
            break;
          }
          
          container = container.parentElement;
          attempts++;
        }
      }
    });
    
    if (foundUser) {
      console.log('✅ Пользователь найден!');
      this.analyzeUserDataImproved(foundUser, username);
    } else {
      console.log('❌ Пользователь не найден в текущем модальном окне');
    }
  }

  // Улучшенная функция анализа данных пользователя
  analyzeUserDataImproved(container, targetUsername) {
    try {
      console.log('🔍 Улучшенный анализ данных пользователя:');
      
      console.log('📦 Контейнер пользователя:', {
        tagName: container.tagName,
        className: container.className,
        id: container.id,
        textLength: container.textContent.length
      });
      
      // Извлекаем все возможные данные
      const userData = this.extractAllUserDataImproved(container, targetUsername);
      
      console.log('👤 Основная информация:', {
        username: userData.username,
        displayName: userData.displayName,
        fullName: userData.fullName,
        bio: userData.bio
      });
      
      console.log('🖼️ Аватарка:', {
        hasAvatar: userData.hasAvatar,
        avatarUrl: userData.avatarUrl,
        isDefaultAvatar: userData.isDefaultAvatar,
        avatarSize: userData.avatarSize
      });
      
      console.log('📊 Статистика:', {
        followers: userData.followers,
        following: userData.following,
        posts: userData.posts
      });
      
      console.log('🏷️ Метаданные:', {
        verified: userData.verified,
        private: userData.private,
        business: userData.business,
        location: userData.location,
        website: userData.website
      });
      
      console.log('🔗 Ссылки:', {
        profileUrl: userData.profileUrl,
        avatarElement: userData.avatarElement ? 'найден' : 'не найден',
        followButton: userData.followButton ? 'найден' : 'не найден'
      });
      
      console.log('📝 Дополнительный текст:', {
        allText: userData.allText.substring(0, 200) + '...',
        textElements: userData.textElements.length
      });
      
    } catch (error) {
      console.error('Ошибка анализа данных пользователя:', error);
    }
  }

  // Улучшенная функция для извлечения всех возможных данных о пользователе
  extractAllUserDataImproved(container, targetUsername) {
    const data = {
      username: null,
      displayName: null,
      fullName: null,
      bio: null,
      hasAvatar: false,
      avatarUrl: null,
      isDefaultAvatar: false,
      avatarSize: null,
      followers: null,
      following: null,
      posts: null,
      verified: false,
      private: false,
      business: false,
      location: null,
      website: null,
      profileUrl: null,
      avatarElement: null,
      followButton: null,
      allText: '',
      textElements: []
    };
    
    try {
      // Собираем весь текст
      data.allText = container.textContent || '';
      
      // Ищем все текстовые элементы
      const textElements = container.querySelectorAll('span, div, a, h1, h2, h3, p');
      data.textElements = Array.from(textElements).map(el => ({
        tagName: el.tagName,
        text: el.textContent.trim(),
        className: el.className,
        id: el.id
      }));
      
      // Ищем аватарку
      const avatarImg = container.querySelector('img');
      if (avatarImg) {
        data.avatarElement = avatarImg;
        data.avatarUrl = avatarImg.src;
        data.hasAvatar = true;
        data.isDefaultAvatar = this.isDefaultAvatar(avatarImg.src);
        data.avatarSize = {
          width: avatarImg.naturalWidth || avatarImg.width,
          height: avatarImg.naturalHeight || avatarImg.height
        };
      }
      
      // Ищем кнопку подписки
      const followBtn = container.querySelector('button, div[role="button"]');
      if (followBtn) {
        data.followButton = followBtn;
      }
      
      // Ищем ссылку на профиль
      const profileLink = container.querySelector('a[href*="/@"]');
      if (profileLink) {
        data.profileUrl = profileLink.href;
      }
      
      // Анализируем текст для извлечения информации
      const text = data.allText;
      
      // Ищем username (обычно начинается с @)
      const usernameMatch = text.match(/@([a-zA-Z0-9._]+)/);
      if (usernameMatch) {
        data.username = usernameMatch[1];
      }
      
      // Если не нашли через @, ищем точное совпадение
      if (!data.username) {
        const usernameRegex = new RegExp(`\\b${targetUsername}\\b`, 'i');
        if (usernameRegex.test(text)) {
          data.username = targetUsername;
        }
      }
      
      // Ищем display name - текст рядом с username
      const usernameRegex = new RegExp(`\\b${data.username || targetUsername}\\b`, 'i');
      const usernameIndex = text.search(usernameRegex);
      
      if (usernameIndex !== -1) {
        // Ищем текст до и после username
        const beforeUsername = text.substring(0, usernameIndex).trim();
        const afterUsername = text.substring(usernameIndex + (data.username || targetUsername).length).trim();
        
        // Ищем display name в тексте после username
        const displayNameMatch = afterUsername.match(/^([^•\n]+?)(?=Following|Follow|$)/);
        if (displayNameMatch) {
          data.displayName = displayNameMatch[1].trim();
        }
        
        // Если не нашли, ищем в тексте до username
        if (!data.displayName) {
          const displayNameMatchBefore = beforeUsername.match(/([^•\n]+?)$/);
          if (displayNameMatchBefore) {
            data.displayName = displayNameMatchBefore[1].trim();
          }
        }
      }
      
      // Ищем статистику (followers, following, posts)
      const followersMatch = text.match(/(\d+)\s*(followers?|подписчиков?)/i);
      if (followersMatch) {
        data.followers = parseInt(followersMatch[1]);
      }
      
      const followingMatch = text.match(/(\d+)\s*(following|подписок?)/i);
      if (followingMatch) {
        data.following = parseInt(followingMatch[1]);
      }
      
      const postsMatch = text.match(/(\d+)\s*(posts?|постов?)/i);
      if (postsMatch) {
        data.posts = parseInt(postsMatch[1]);
      }
      
      // Ищем верификацию
      data.verified = text.includes('✓') || text.includes('verified') || text.includes('верифицирован');
      
      // Ищем приватность
      data.private = text.includes('private') || text.includes('приватный');
      
      // Ищем бизнес-аккаунт
      data.business = text.includes('business') || text.includes('бизнес');
      
      // Ищем локацию
      const locationMatch = text.match(/📍\s*([^•\n]+)/);
      if (locationMatch) {
        data.location = locationMatch[1].trim();
      }
      
      // Ищем веб-сайт
      const websiteMatch = text.match(/🌐\s*([^•\n]+)/);
      if (websiteMatch) {
        data.website = websiteMatch[1].trim();
      }
      
    } catch (error) {
      console.error('Ошибка извлечения данных:', error);
    }
    
    return data;
  }

  // Функция для тестирования извлечения данных конкретного пользователя
  testUserExtraction(username) {
    console.log(`🧪 Тестирование извлечения данных для пользователя: ${username}`);
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('❌ Модальное окно не найдено');
      return;
    }
    
    // Ищем все кнопки подписки
    const subscribeButtons = [];
    const allButtons = modal.querySelectorAll('button, div');
    
    allButtons.forEach((element) => {
      const text = element.textContent.trim();
      const subscribeButtonTexts = this.getSubscribeButtonTexts();
      const isSubscribeButton = subscribeButtonTexts.includes(text) || 
                               subscribeButtonTexts.some(btnText => text.includes(btnText));
      
      if (isSubscribeButton) {
        subscribeButtons.push(element);
      }
    });
    
    console.log(`📊 Найдено ${subscribeButtons.length} кнопок подписки`);
    
    // Ищем кнопку, которая может содержать нужного пользователя
    let foundButton = null;
    for (const button of subscribeButtons) {
      const userInfo = this.extractUsernameFromButton(button);
      if (userInfo.username && userInfo.username.includes(username)) {
        foundButton = button;
        console.log(`✅ Найдена кнопка для пользователя ${username}:`, {
          username: userInfo.username,
          displayName: userInfo.displayName
        });
        break;
      }
    }
    
    if (foundButton) {
      console.log('🔍 Детальный анализ найденной кнопки:');
      this.analyzeUserDataImproved(foundButton.parentElement, username);
    } else {
      console.log(`❌ Не удалось найти кнопку для пользователя ${username}`);
    }
  }

  // Функция для поиска онлайн статуса пользователей
  findOnlineStatusIndicators() {
    console.log('🟢 Поиск индикаторов онлайн статуса пользователей');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('❌ Модальное окно не найдено');
      return;
    }
    
    // Ищем различные индикаторы онлайн статуса
    const indicators = {
      // Зеленые точки (классический индикатор онлайн)
      greenDots: modal.querySelectorAll('[style*="background-color: rgb(0, 255, 0)"], [style*="background-color: #00ff00"], [style*="background-color: green"]'),
      
      // Элементы с классами, содержащими "online", "active", "live"
      onlineClasses: modal.querySelectorAll('[class*="online"], [class*="active"], [class*="live"], [class*="status"]'),
      
      // Элементы с атрибутами, указывающими на статус
      statusAttributes: modal.querySelectorAll('[data-status], [aria-label*="online"], [aria-label*="active"], [title*="online"], [title*="active"]'),
      
      // Ищем элементы с зеленым цветом
      greenElements: modal.querySelectorAll('*'),
      
      // Ищем SVG иконки статуса
      statusIcons: modal.querySelectorAll('svg, [class*="icon"], [class*="status"]'),
      
      // Ищем элементы с текстом "online", "active", "live"
      statusText: modal.querySelectorAll('*')
    };
    
    // Фильтруем зеленые элементы
    const greenElements = Array.from(indicators.greenElements).filter(el => {
      const style = window.getComputedStyle(el);
      const bgColor = style.backgroundColor;
      const borderColor = style.borderColor;
      return bgColor.includes('rgb(0, 255, 0)') || 
             bgColor.includes('#00ff00') || 
             bgColor.includes('green') ||
             borderColor.includes('rgb(0, 255, 0)') ||
             borderColor.includes('#00ff00') ||
             borderColor.includes('green');
    });
    
    // Фильтруем элементы с текстом статуса
    const statusTextElements = Array.from(indicators.statusText).filter(el => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes('online') || text.includes('active') || text.includes('live') || text.includes('онлайн');
    });
    
    console.log('\n📊 === РЕЗУЛЬТАТЫ ПОИСКА ОНЛАЙН СТАТУСА ===');
    console.log(`🟢 Зеленые точки (style): ${indicators.greenDots.length}`);
    console.log(`📱 Элементы с классами статуса: ${indicators.onlineClasses.length}`);
    console.log(`🏷️ Элементы с атрибутами статуса: ${indicators.statusAttributes.length}`);
    console.log(`🟢 Зеленые элементы (computed): ${greenElements.length}`);
    console.log(`🎨 SVG иконки статуса: ${indicators.statusIcons.length}`);
    console.log(`📝 Элементы с текстом статуса: ${statusTextElements.length}`);
    
    // Анализируем найденные элементы
    if (greenElements.length > 0) {
      console.log('\n🟢 === ЗЕЛЕНЫЕ ЭЛЕМЕНТЫ (возможные индикаторы онлайн) ===');
      greenElements.slice(0, 5).forEach((el, index) => {
        console.log(`\n--- ЭЛЕМЕНТ ${index + 1} ---`);
        console.log(`Tag: ${el.tagName}`);
        console.log(`Class: ${el.className}`);
        console.log(`Style: ${el.style.cssText}`);
        console.log(`Computed BG: ${window.getComputedStyle(el).backgroundColor}`);
        console.log(`Computed Border: ${window.getComputedStyle(el).borderColor}`);
        console.log(`Text: "${el.textContent?.substring(0, 50)}..."`);
        console.log(`Parent: ${el.parentElement?.tagName} - ${el.parentElement?.className}`);
      });
    }
    
    if (statusTextElements.length > 0) {
      console.log('\n📝 === ЭЛЕМЕНТЫ С ТЕКСТОМ СТАТУСА ===');
      statusTextElements.slice(0, 5).forEach((el, index) => {
        console.log(`\n--- ЭЛЕМЕНТ ${index + 1} ---`);
        console.log(`Tag: ${el.tagName}`);
        console.log(`Class: ${el.className}`);
        console.log(`Text: "${el.textContent}"`);
        console.log(`Parent: ${el.parentElement?.tagName} - ${el.parentElement?.className}`);
      });
    }
    
    // Ищем специфичные для Threads индикаторы
    this.findThreadsSpecificIndicators(modal);
    
    return {
      greenDots: indicators.greenDots.length,
      onlineClasses: indicators.onlineClasses.length,
      statusAttributes: indicators.statusAttributes.length,
      greenElements: greenElements.length,
      statusIcons: indicators.statusIcons.length,
      statusText: statusTextElements.length,
      greenElementsList: greenElements,
      statusTextList: statusTextElements
    };
  }

  // Поиск специфичных для Threads индикаторов
  findThreadsSpecificIndicators(modal) {
    console.log('\n🧵 === ПОИСК СПЕЦИФИЧНЫХ ДЛЯ THREADS ИНДИКАТОРОВ ===');
    
    // Ищем элементы с классами, характерными для Threads
    const threadsClasses = [
      'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', // Threads использует такие классы
      'x1i10hfl', 'x1qjc9v5', 'xjbqb8w', 'x1ypdohk', 'xdl72j9', // Примеры реальных классов
      'x2lah0s', 'x3ct3a4', 'xdj266r', 'x14z9mp', 'xat24cr'
    ];
    
    threadsClasses.forEach(className => {
      const elements = modal.querySelectorAll(`[class*="${className}"]`);
      if (elements.length > 0) {
        // Проверяем, есть ли среди них зеленые элементы
        const greenElements = Array.from(elements).filter(el => {
          const style = window.getComputedStyle(el);
          const bgColor = style.backgroundColor;
          return bgColor.includes('rgb(0, 255, 0)') || 
                 bgColor.includes('#00ff00') || 
                 bgColor.includes('green');
        });
        
        if (greenElements.length > 0) {
          console.log(`\n🟢 Найдены зеленые элементы с классом "${className}": ${greenElements.length}`);
          greenElements.slice(0, 3).forEach((el, index) => {
            console.log(`  ${index + 1}. ${el.tagName} - ${el.className}`);
            console.log(`     BG: ${window.getComputedStyle(el).backgroundColor}`);
            console.log(`     Text: "${el.textContent?.substring(0, 30)}..."`);
          });
        }
      }
    });
    
    // Ищем элементы рядом с аватарками
    const avatars = modal.querySelectorAll('img[alt*="profile"], img[alt*="avatar"], img[src*="profile"]');
    console.log(`\n🖼️ Найдено аватарок: ${avatars.length}`);
    
    avatars.forEach((avatar, index) => {
      if (index < 5) { // Анализируем первые 5 аватарок
        console.log(`\n--- АВАТАРКА ${index + 1} ---`);
        console.log(`Alt: ${avatar.alt}`);
        console.log(`Src: ${avatar.src?.substring(0, 100)}...`);
        
        // Ищем элементы рядом с аватаркой
        const parent = avatar.parentElement;
        const siblings = Array.from(parent?.children || []);
        const greenSiblings = siblings.filter(sibling => {
          const style = window.getComputedStyle(sibling);
          const bgColor = style.backgroundColor;
          return bgColor.includes('rgb(0, 255, 0)') || 
                 bgColor.includes('#00ff00') || 
                 bgColor.includes('green');
        });
        
        if (greenSiblings.length > 0) {
          console.log(`🟢 Найдены зеленые элементы рядом с аватаркой: ${greenSiblings.length}`);
          greenSiblings.forEach((sibling, i) => {
            console.log(`  ${i + 1}. ${sibling.tagName} - ${sibling.className}`);
            console.log(`     BG: ${window.getComputedStyle(sibling).backgroundColor}`);
          });
        }
      }
    });
  }

  // Функция для проверки онлайн статуса конкретного пользователя
  checkUserOnlineStatus(username) {
    console.log(`🟢 Проверка онлайн статуса пользователя: ${username}`);
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('❌ Модальное окно не найдено');
      return null;
    }
    
    // Ищем контейнер пользователя
    const userContainer = this.findUserContainer(username, modal);
    if (!userContainer) {
      console.log(`❌ Контейнер пользователя ${username} не найден`);
      return null;
    }
    
    console.log(`✅ Найден контейнер пользователя ${username}`);
    
    // Ищем индикаторы онлайн статуса в контейнере
    const onlineIndicators = this.findOnlineIndicatorsInContainer(userContainer);
    
    const result = {
      username: username,
      isOnline: onlineIndicators.hasOnlineIndicator,
      indicators: onlineIndicators,
      container: userContainer
    };
    
    console.log(`📊 Результат для ${username}:`, result);
    return result;
  }

  // Поиск контейнера пользователя
  findUserContainer(username, modal) {
    // Ищем по username в тексте
    const elements = modal.querySelectorAll('*');
    
    for (const element of elements) {
      const text = element.textContent || '';
      if (text.includes(username)) {
        // Проверяем, что это контейнер пользователя (содержит аватарку и кнопку Follow)
        const hasAvatar = element.querySelector('img');
        const hasFollowButton = text.includes('Follow');
        
        if (hasAvatar && hasFollowButton) {
          return element;
        }
      }
    }
    
    return null;
  }

  // Поиск индикаторов онлайн в контейнере
  findOnlineIndicatorsInContainer(container) {
    const indicators = {
      hasOnlineIndicator: false,
      greenDots: [],
      statusElements: [],
      statusText: [],
      details: []
    };
    
    // Ищем все элементы в контейнере
    const allElements = container.querySelectorAll('*');
    
    allElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const bgColor = style.backgroundColor;
      const borderColor = style.borderColor;
      const text = element.textContent?.toLowerCase() || '';
      
      // Проверяем зеленые элементы (классический индикатор онлайн) - расширенный поиск
      if (bgColor.includes('rgb(0, 255, 0)') || 
          bgColor.includes('#00ff00') || 
          bgColor.includes('green') ||
          bgColor.includes('rgb(34, 197, 94)') || // Зеленый цвет Threads
          bgColor.includes('#22c55e') ||
          borderColor.includes('rgb(0, 255, 0)') ||
          borderColor.includes('#00ff00') ||
          borderColor.includes('green') ||
          borderColor.includes('rgb(34, 197, 94)') ||
          borderColor.includes('#22c55e')) {
        
        indicators.greenDots.push({
          element: element,
          tagName: element.tagName,
          className: element.className,
          backgroundColor: bgColor,
          borderColor: borderColor,
          text: element.textContent?.substring(0, 50)
        });
        
        indicators.hasOnlineIndicator = true;
      }
      
      // Проверяем элементы с текстом статуса (расширенный поиск)
      if (text.includes('online') || text.includes('active') || text.includes('live') || 
          text.includes('онлайн') || text.includes('активен') || text.includes('в эфире') ||
          text.includes('available') || text.includes('доступен') || text.includes('connected') ||
          text.includes('подключен') || text.includes('now') || text.includes('сейчас')) {
        indicators.statusText.push({
          element: element,
          tagName: element.tagName,
          className: element.className,
          text: element.textContent
        });
        
        indicators.hasOnlineIndicator = true;
      }
      
      // Проверяем элементы с классами статуса
      const className = element.className || '';
      const classNameString = typeof className === 'string' ? className : className.toString();
      
      if (classNameString.includes('online') || 
          classNameString.includes('active') || 
          classNameString.includes('live') || 
          classNameString.includes('status') ||
          classNameString.includes('available') ||
          classNameString.includes('connected') ||
          classNameString.includes('presence') ||
          classNameString.includes('indicator') ||
          classNameString.includes('dot') ||
          classNameString.includes('badge')) {
        
        indicators.statusElements.push({
          element: element,
          tagName: element.tagName,
          className: classNameString,
          text: element.textContent?.substring(0, 50)
        });
        
        indicators.hasOnlineIndicator = true;
      }
    });
    
    // Создаем детальный отчет
    indicators.details = {
      totalElements: allElements.length,
      greenDotsCount: indicators.greenDots.length,
      statusElementsCount: indicators.statusElements.length,
      statusTextCount: indicators.statusText.length
    };
    
    return indicators;
  }

  // Функция для анализа всех доступных данных из DOM
  analyzeAvailableData() {
    console.log('🔍 Анализ всех доступных данных из DOM модального окна');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('❌ Модальное окно не найдено');
      return;
    }
    
    // Получаем весь текст из модального окна
    const fullText = modal.textContent || '';
    console.log('📄 Полный текст модального окна:', fullText.substring(0, 500) + '...');
    
    // Анализируем структуру данных
    this.analyzeTextStructure(fullText);
    
    // Ищем отдельные пользователей
    this.extractIndividualUsers(fullText);
    
    // Анализируем статистику
    this.analyzeStatistics(fullText);
  }

  // Анализ структуры текста
  analyzeTextStructure(text) {
    console.log('\n📊 === АНАЛИЗ СТРУКТУРЫ ТЕКСТА ===');
    
    // Ищем паттерны
    const patterns = {
      followers: /Followers(\d+)/gi,
      following: /Following(\d+)/gi,
      usernames: /@?([a-zA-Z0-9._]+)/g,
      displayNames: /([A-ZА-Я][a-zA-Zа-яё\s]+[a-zA-Zа-яё])/g,
      followButtons: /Follow(ing)?/gi,
      bioText: /[•·]\s*[^Follow]+/g,
      emojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
    };
    
    Object.entries(patterns).forEach(([name, pattern]) => {
      const matches = [...text.matchAll(pattern)];
      console.log(`\n🔍 ${name.toUpperCase()}:`);
      console.log(`   Найдено: ${matches.length} совпадений`);
      if (matches.length > 0) {
        console.log(`   Примеры: ${matches.slice(0, 5).map(m => m[1] || m[0]).join(', ')}`);
      }
    });
  }

  // Извлечение отдельных пользователей
  extractIndividualUsers(text) {
    console.log('\n👥 === ИЗВЛЕЧЕНИЕ ОТДЕЛЬНЫХ ПОЛЬЗОВАТЕЛЕЙ ===');
    
    // Разбиваем текст по кнопкам Follow/Following
    const userSections = text.split(/(?=Follow(?:ing)?)/g);
    console.log(`📊 Найдено секций пользователей: ${userSections.length}`);
    
    // Анализируем первые 10 пользователей
    userSections.slice(0, 10).forEach((section, index) => {
      if (section.trim().length > 10) {
        console.log(`\n--- ПОЛЬЗОВАТЕЛЬ ${index + 1} ---`);
        console.log(`Текст: "${section.trim().substring(0, 100)}..."`);
        
        // Извлекаем данные
        const userData = this.parseUserSection(section);
        console.log('Данные:', userData);
      }
    });
  }

  // Парсинг секции пользователя
  parseUserSection(section) {
    const data = {
      username: null,
      displayName: null,
      bio: null,
      hasFollowButton: false,
      followButtonText: null,
      emojis: [],
      textLength: section.length
    };
    
    // Username (латиница + цифры + точки + подчеркивания)
    const usernameMatch = section.match(/([a-zA-Z0-9._]+)/);
    if (usernameMatch) {
      data.username = usernameMatch[1];
    }
    
    // Display name (кириллица или латиница с заглавной буквы)
    const displayNameMatch = section.match(/([A-ZА-Я][a-zA-Zа-яё\s]+[a-zA-Zа-яё])/);
    if (displayNameMatch) {
      data.displayName = displayNameMatch[1].trim();
    }
    
    // Bio (текст между • и Follow)
    const bioMatch = section.match(/[•·]\s*([^Follow]+?)(?=Follow|$)/);
    if (bioMatch) {
      data.bio = bioMatch[1].trim();
    }
    
    // Follow button
    const followMatch = section.match(/(Follow(?:ing)?)/);
    if (followMatch) {
      data.hasFollowButton = true;
      data.followButtonText = followMatch[1];
    }
    
    // Emojis
    const emojiMatches = [...section.matchAll(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu)];
    data.emojis = emojiMatches.map(m => m[0]);
    
    return data;
  }

  // Анализ статистики
  analyzeStatistics(text) {
    console.log('\n📈 === АНАЛИЗ СТАТИСТИКИ ===');
    
    // Статистика профиля
    const followersMatch = text.match(/Followers(\d+)/i);
    const followingMatch = text.match(/Following(\d+)/i);
    
    if (followersMatch) {
      console.log(`👥 Подписчики: ${followersMatch[1]}`);
    }
    if (followingMatch) {
      console.log(`👤 Подписки: ${followingMatch[1]}`);
    }
    
    // Подсчет пользователей
    const followButtons = (text.match(/Follow(?:ing)?/g) || []).length;
    console.log(`🔘 Кнопки Follow/Following: ${followButtons}`);
    
    // Подсчет username
    const usernames = [...text.matchAll(/@?([a-zA-Z0-9._]+)/g)].length;
    console.log(`🏷️ Username: ${usernames}`);
    
    // Подсчет display names
    const displayNames = [...text.matchAll(/([A-ZА-Я][a-zA-Zа-яё\s]+[a-zA-Zа-яё])/g)].length;
    console.log(`📝 Display Names: ${displayNames}`);
    
    // Подсчет emoji
    const emojis = [...text.matchAll(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu)].length;
    console.log(`😀 Emoji: ${emojis}`);
  }

  // Функция для извлечения всех пользователей из текста
  extractAllUsersFromText() {
    console.log('👥 Извлечение всех пользователей из текста модального окна');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('❌ Модальное окно не найдено');
      return [];
    }
    
    const fullText = modal.textContent || '';
    
    // Улучшенный алгоритм извлечения пользователей
    const users = this.parseAllUsers(fullText);
    
    console.log(`\n📊 Найдено пользователей: ${users.length}`);
    
    // Показываем первые 10 пользователей
    users.slice(0, 10).forEach((user, index) => {
      console.log(`\n--- ПОЛЬЗОВАТЕЛЬ ${index + 1} ---`);
      console.log(`Username: ${user.username}`);
      console.log(`Display Name: ${user.displayName}`);
      console.log(`Bio: ${user.bio || 'Нет'}`);
      console.log(`Follow Button: ${user.followButtonText}`);
      console.log(`Emojis: ${user.emojis.join(', ') || 'Нет'}`);
      console.log(`Язык: ${user.nameLanguage}`);
    });
    
    return users;
  }

  // Улучшенный парсинг всех пользователей
  parseAllUsers(text) {
    const users = [];
    
    // Разбиваем текст на секции пользователей
    // Ищем паттерн: username + displayName + bio + Follow/Following
    const userPattern = /([a-zA-Z0-9._]+)([A-ZА-Я][a-zA-Zа-яё\s]*[a-zA-Zа-яё])([^Follow]*?)(Follow(?:ing)?)/g;
    
    let match;
    while ((match = userPattern.exec(text)) !== null) {
      const [, username, displayName, bio, followButton] = match;
      
      // Очищаем данные
      const cleanUsername = username.trim();
      const cleanDisplayName = displayName.trim();
      const cleanBio = bio.replace(/[•·]/g, '').trim();
      
      // Пропускаем если username слишком короткий или содержит недопустимые символы
      if (cleanUsername.length < 3 || /[^a-zA-Z0-9._]/.test(cleanUsername)) {
        continue;
      }
      
      // Извлекаем emoji из bio
      const emojiMatches = [...cleanBio.matchAll(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu)];
      const emojis = emojiMatches.map(m => m[0]);
      
      // Определяем язык имени
      const nameLanguage = this.detectNameLanguage(cleanDisplayName);
      
      users.push({
        username: cleanUsername,
        displayName: cleanDisplayName,
        bio: cleanBio || null,
        followButtonText: followButton,
        emojis: emojis,
        nameLanguage: nameLanguage,
        hasBio: cleanBio.length > 0,
        bioLength: cleanBio.length,
        displayNameLength: cleanDisplayName.length,
        usernameLength: cleanUsername.length
      });
    }
    
    return users;
  }

  // Функция для тестирования конкретного случая из лога
  testSpecificCase() {
    console.log('🧪 Тестирование конкретного случая: "8831.pirencesSilent Beauty:)"');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('❌ Модальное окно не найдено');
      return;
    }
    
    // Ищем все кнопки подписки
    const subscribeButtons = [];
    const allButtons = modal.querySelectorAll('button, div');
    
    allButtons.forEach((element) => {
      const text = element.textContent.trim();
      const subscribeButtonTexts = this.getSubscribeButtonTexts();
      const isSubscribeButton = subscribeButtonTexts.includes(text) || 
                               subscribeButtonTexts.some(btnText => text.includes(btnText));
      
      if (isSubscribeButton) {
        subscribeButtons.push(element);
      }
    });
    
    console.log(`📊 Найдено ${subscribeButtons.length} кнопок подписки`);
    
    // Тестируем извлечение данных для каждой кнопки
    subscribeButtons.slice(0, 3).forEach((button, index) => {
      console.log(`\n=== ТЕСТ КНОПКИ ${index + 1} ===`);
      const userInfo = this.extractUsernameFromButton(button);
      console.log('Результат извлечения:', {
        username: userInfo.username,
        displayName: userInfo.displayName
      });
    });
  }

  // Функция для анализа всех пользователей в модальном окне
  analyzeAllUsers() {
    console.log('🔍 Анализ всех пользователей в модальном окне');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('❌ Модальное окно не найдено');
      return;
    }
    
    // Ищем все кнопки подписки
    const subscribeButtons = [];
    const allButtons = modal.querySelectorAll('button, div');
    
    allButtons.forEach((element) => {
      const text = element.textContent.trim();
      const subscribeButtonTexts = this.getSubscribeButtonTexts();
      const isSubscribeButton = subscribeButtonTexts.includes(text) || 
                               subscribeButtonTexts.some(btnText => text.includes(btnText));
      
      if (isSubscribeButton) {
        subscribeButtons.push(element);
      }
    });
    
    console.log(`📊 Найдено ${subscribeButtons.length} пользователей для анализа`);
    
    // Анализируем каждого пользователя
    subscribeButtons.slice(0, 5).forEach((button, index) => {
      console.log(`\n=== ПОЛЬЗОВАТЕЛЬ ${index + 1} ===`);
      
      // Ищем родительский контейнер
      let container = button.parentElement;
      let attempts = 0;
      
      while (container && attempts < 15) {
        const containerText = container.textContent || '';
        const hasFollowButton = container.querySelector('button, div[role="button"]');
        const hasAvatar = container.querySelector('img');
        
        // Более строгие критерии для размера контейнера
        if (hasFollowButton && hasAvatar && 
            containerText.length > 20 && 
            containerText.length < 200 &&
            container.tagName !== 'HTML' &&
            container.tagName !== 'BODY' &&
            container.tagName !== 'DIV' && 
            !container.id.includes('mount_')) {
          break;
        }
        
        container = container.parentElement;
        attempts++;
      }
      
      if (container) {
        // Извлекаем username из контейнера
        const text = container.textContent || '';
        const usernameMatch = text.match(/@([a-zA-Z0-9._]+)/);
        const username = usernameMatch ? usernameMatch[1] : `user_${index + 1}`;
        
        this.analyzeUserDataImproved(container, username);
      } else {
        console.log('❌ Не удалось найти контейнер пользователя');
      }
    });
  }

  // Проверка, находится ли пользователь в игнор-списке
  isUserInIgnoreList(username) {
    const ignoreListArray = this.ignoreList.split('\n')
      .map(user => user.trim())
      .filter(user => user.length > 0);
    return ignoreListArray.includes(username);
  }

  // Добавление пользователя в игнор-список
  addToIgnoreList(username) {
    const ignoreListArray = this.ignoreList.split('\n')
      .map(user => user.trim())
      .filter(user => user.length > 0);
    
    if (!ignoreListArray.includes(username)) {
      ignoreListArray.push(username);
      this.ignoreList = ignoreListArray.join('\n');
      console.log(`Threads Auto Follow: [DEBUG] Добавлен в игнор-список: ${username}`);
      
      // Сохраняем состояние
      this.saveState();
      
      // Отправляем обновление в popup
      chrome.runtime.sendMessage({
        action: 'updateIgnoreList',
        ignoreList: this.ignoreList
      });
    }
  }

  // Удаление пользователя из игнор-списка
  removeFromIgnoreList(username) {
    const ignoreListArray = this.ignoreList.split('\n')
      .map(user => user.trim())
      .filter(user => user.length > 0);
    
    const index = ignoreListArray.indexOf(username);
    if (index > -1) {
      ignoreListArray.splice(index, 1);
      this.ignoreList = ignoreListArray.join('\n');
      console.log(`Threads Auto Follow: [DEBUG] Удален из игнор-списка: ${username}`);
      
      // Сохраняем состояние
      this.saveState();
      
      // Отправляем обновление в popup
      chrome.runtime.sendMessage({
        action: 'updateIgnoreList',
        ignoreList: this.ignoreList
      });
    }
  }


  // Автоматическое удаление пользователей из списка, если они в игнор-списке
  autoRemoveIgnoredUsers() {
    const ignoreListArray = this.ignoreList.split('\n')
      .map(user => user.trim())
      .filter(user => user.length > 0);
    
    if (ignoreListArray.length === 0) {
      console.log(`Threads Auto Follow: [DEBUG] Игнор-список пуст, нечего удалять`);
      return;
    }
    
    const originalLength = this.userList.length;
    const removedUsers = [];
    
    // Фильтруем список пользователей, удаляя тех, кто в игнор-списке
    this.userList = this.userList.filter(username => {
      if (ignoreListArray.includes(username)) {
        removedUsers.push(username);
        console.log(`Threads Auto Follow: [DEBUG] Автоматически удален из списка пользователей (находится в игнор-списке): ${username}`);
        return false;
      }
      return true;
    });
    
    if (removedUsers.length > 0) {
      console.log(`Threads Auto Follow: [DEBUG] Автоматически удалено ${removedUsers.length} пользователей из списка (находятся в игнор-списке): ${removedUsers.join(', ')}`);
      
      // Сохраняем состояние
      this.saveState();
      
      // Отправляем обновление в popup
      chrome.runtime.sendMessage({
        action: 'updateUserList',
        userList: this.userList
      });
      
      // Показываем уведомление
      this.showNotification(`Автоматически удалено ${removedUsers.length} пользователей из списка (находятся в игнор-списке)`, 'info');
    } else {
      console.log(`Threads Auto Follow: [DEBUG] Все пользователи в списке не находятся в игнор-списке`);
    }
  }

  // Удаление пользователя из списка пользователей
  removeFromUserList(username) {
    const userListArray = this.userList;
    const index = userListArray.indexOf(username);
    if (index > -1) {
      userListArray.splice(index, 1);
      this.userList = userListArray;
      console.log(`Threads Auto Follow: [DEBUG] Удален из списка пользователей: ${username}`);
      
      // Сохраняем состояние
      this.saveState();
      
      // Отправляем обновление в popup
      chrome.runtime.sendMessage({
        action: 'updateUserList',
        userList: this.userList
      });
    }
  }

  // Проверка, нужно ли работать со списком пользователей
  shouldWorkWithUserList() {
    return this.userList.length > 0;
  }

  // Получение текущего пользователя из списка
  getCurrentUserFromList() {
    if (this.userList.length === 0 || this.currentUserIndex >= this.userList.length) {
      return null;
    }
    return this.userList[this.currentUserIndex];
  }

  // Подписка на пользователей из списка
  async followUsersFromList() {
    console.log(`Threads Auto Follow: [DEBUG] Начинаем подписку на пользователей из списка: ${this.userList.join(', ')}`);
    
    // Автоматически удаляем пользователей из списка, если они в игнор-списке
    this.autoRemoveIgnoredUsers();
    
    // Проверяем, не достигнут ли уже лимит
    if (this.subscribedCount >= this.targetCount) {
      console.log(`Threads Auto Follow: [DEBUG] Лимит подписок уже достигнут (${this.subscribedCount}/${this.targetCount})`);
      this.showNotification(`Лимит подписок уже достигнут! Подписано на ${this.subscribedCount} пользователей`, 'info');
      this.isRunning = false;
      this.isFollowingUsersFromList = false;
      this.updateStatus();
      this.clearState();
      return;
    }
    
    // Начинаем с первого пользователя
    this.currentUserIndex = 0;
    this.currentUsername = this.userList[0];
    
    // Сохраняем состояние
    this.saveState();
    
    // Переходим на профиль первого пользователя
    const profileUrl = `https://www.threads.net/@${this.currentUsername}`;
    console.log(`Threads Auto Follow: [DEBUG] Переходим на ${profileUrl}`);
    window.location.href = profileUrl;
  }

  // Проверка, подписаны ли мы уже на пользователя
  isAlreadySubscribed() {
    console.log(`Threads Auto Follow: [DEBUG] Проверяем, подписаны ли мы уже на пользователя`);
    
    // Ищем все возможные кнопки
    const allButtons = document.querySelectorAll('button, div[role="button"], a[role="button"]');
    console.log(`Threads Auto Follow: [DEBUG] Найдено ${allButtons.length} кнопок на странице`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = button.textContent?.toLowerCase() || '';
      const className = button.className || '';
      
      console.log(`Threads Auto Follow: [DEBUG] Кнопка ${i + 1}: текст="${text}", класс="${className}"`);
      
      // Проверяем текст кнопки на отписку
      if (text.includes('отписаться') || text.includes('unfollow') || 
          text.includes('подписки') || text.includes('following')) {
        console.log(`Threads Auto Follow: [DEBUG] Найдена кнопка отписки, пользователь уже подписан:`, button);
        return true;
      }
    }
    
    // Дополнительный поиск по атрибутам
    const unfollowButtons = document.querySelectorAll('[data-testid*="unfollow"], [aria-label*="unfollow"], [aria-label*="Unfollow"]');
    for (const button of unfollowButtons) {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('отписаться') || text.includes('unfollow')) {
        console.log(`Threads Auto Follow: [DEBUG] Найдена кнопка отписки по атрибутам, пользователь уже подписан:`, button);
        return true;
      }
    }
    
    // Проверяем наличие текста "Подписки" в навигации
    const subscriptionsTab = document.querySelector('a[href*="following"], a[href*="подписки"]');
    if (subscriptionsTab) {
      console.log(`Threads Auto Follow: [DEBUG] Найдена вкладка подписок, пользователь может быть подписан`);
      // Дополнительная проверка - ищем кнопку "Подписаться"
      const subscribeButton = this.findSubscribeButtonOnProfile();
      if (!subscribeButton) {
        console.log(`Threads Auto Follow: [DEBUG] Кнопка подписки не найдена, вероятно уже подписан`);
        return true;
      }
    }
    
    console.log(`Threads Auto Follow: [DEBUG] Пользователь не подписан`);
    return false;
  }

  // Проверка, подписаны ли мы уже на пользователя по кнопке в списке
  isAlreadySubscribedFromButton(button) {
    const text = button.textContent?.toLowerCase() || '';
    const parentText = button.parentElement?.textContent?.toLowerCase() || '';
    
    // Проверяем текст кнопки на отписку
    if (text.includes('отписаться') || text.includes('unfollow') || 
        text.includes('подписки') || text.includes('following')) {
      console.log(`Threads Auto Follow: [DEBUG] Кнопка указывает на отписку, пользователь уже подписан`);
      return true;
    }
    
    // Проверяем родительский текст
    if (parentText.includes('отписаться') || parentText.includes('unfollow')) {
      console.log(`Threads Auto Follow: [DEBUG] Родительский текст указывает на отписку, пользователь уже подписан`);
      return true;
    }
    
    // Проверяем атрибуты кнопки
    const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
    if (ariaLabel.includes('unfollow') || ariaLabel.includes('отписаться')) {
      console.log(`Threads Auto Follow: [DEBUG] aria-label указывает на отписку, пользователь уже подписан`);
      return true;
    }
    
    return false;
  }

  // Поиск кнопки подписки на профиле пользователя
  findSubscribeButtonOnProfile() {
    console.log(`Threads Auto Follow: [DEBUG] Ищем кнопку подписки на профиле`);
    
    // Ищем все возможные кнопки
    const allButtons = document.querySelectorAll('button, div[role="button"], a[role="button"]');
    console.log(`Threads Auto Follow: [DEBUG] Найдено ${allButtons.length} кнопок на странице`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = button.textContent?.toLowerCase() || '';
      const className = button.className || '';
      
      console.log(`Threads Auto Follow: [DEBUG] Кнопка ${i + 1}: текст="${text}", класс="${className}"`);
      
      // Проверяем текст кнопки
      if (text.includes('подписаться') || text.includes('follow')) {
        // Дополнительная проверка, что это именно кнопка подписки
        const parentText = button.parentElement?.textContent?.toLowerCase() || '';
        const isUnfollow = text.includes('отписаться') || text.includes('unfollow') || 
                          parentText.includes('отписаться') || parentText.includes('unfollow');
        
        if (!isUnfollow) {
          console.log(`Threads Auto Follow: [DEBUG] Найдена кнопка подписки:`, button);
          return button;
        }
      }
    }
    
    // Дополнительный поиск по атрибутам
    const followButtons = document.querySelectorAll('[data-testid*="follow"], [aria-label*="follow"], [aria-label*="Follow"]');
    for (const button of followButtons) {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('подписаться') || text.includes('follow')) {
        console.log(`Threads Auto Follow: [DEBUG] Найдена кнопка подписки по атрибутам:`, button);
        return button;
      }
    }
    
    console.log(`Threads Auto Follow: [DEBUG] Кнопка подписки не найдена`);
    return null;
  }

  // Получение случайной задержки
  getRandomDelay() {
    return Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
  }

  // Сохранение состояния в storage
  saveState() {
    const state = {
      isRunning: this.isRunning,
      subscribedCount: this.subscribedCount,
      targetCount: this.targetCount,
      avatarFilter: this.avatarFilter,
      nameFilter: this.nameFilter,
      nameLanguage: this.nameLanguage,
      onlineFilter: this.onlineFilter,
      whitelistKeywords: this.whitelistKeywords,
      blacklistKeywords: this.blacklistKeywords,
      minDelay: this.minDelay,
      maxDelay: this.maxDelay,
      userList: this.userList,
      ignoreList: this.ignoreList,
      currentUserIndex: this.currentUserIndex,
      isFollowingUsersFromList: this.isFollowingUsersFromList,
      currentUsername: this.currentUsername
    };
    
    chrome.storage.local.set({ threadsAutoFollowState: state });
    console.log(`Threads Auto Follow: [DEBUG] Состояние сохранено:`, state);
  }

  // Восстановление состояния из storage
  async loadState() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['threadsAutoFollowState'], (result) => {
        if (result.threadsAutoFollowState) {
          const state = result.threadsAutoFollowState;
          this.isRunning = state.isRunning || false;
          this.subscribedCount = state.subscribedCount || 0;
          this.targetCount = state.targetCount || 50;
          this.avatarFilter = state.avatarFilter || 'all';
          this.nameFilter = state.nameFilter || 'all';
          this.nameLanguage = state.nameLanguage || 'all';
          this.onlineFilter = state.onlineFilter || 'all';
          this.whitelistKeywords = state.whitelistKeywords || '';
          this.blacklistKeywords = state.blacklistKeywords || '';
          this.minDelay = state.minDelay || 2000;
          this.maxDelay = state.maxDelay || 8000;
          this.userList = state.userList || [];
          this.ignoreList = state.ignoreList || '';
          this.currentUserIndex = state.currentUserIndex || 0;
          this.isFollowingUsersFromList = state.isFollowingUsersFromList || false;
          this.currentUsername = state.currentUsername || '';
          
          console.log(`Threads Auto Follow: [DEBUG] Состояние восстановлено:`, state);
        }
        resolve();
      });
    });
  }

  // Очистка состояния
  clearState() {
    chrome.storage.local.remove(['threadsAutoFollowState']);
    console.log(`Threads Auto Follow: [DEBUG] Состояние очищено`);
  }

  // Сохранение в историю подписок
  async saveToHistory(username, reason = '') {
    try {
      const historyData = {
        username: username,
        displayName: username, // Для списка пользователей используем username как displayName
        avatarUrl: '', // Нет аватарки для пользователей из списка
        hasAvatar: false,
        profileUrl: `https://www.threads.net/@${username}`,
        following: false, // Не подписчики, а сами пользователи
        followers: 0,
        language: this.detectNameLanguage(username),
        timestamp: new Date().toISOString(),
        reason: reason,
        source: 'user_list'
      };

      // Получаем существующую историю
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['subscriptionHistory'], (result) => {
          resolve(result);
        });
      });

      let history = result.subscriptionHistory || [];
      
      // Добавляем новую запись
      history.unshift(historyData);
      
      // Ограничиваем историю 1000 записями
      if (history.length > 1000) {
        history = history.slice(0, 1000);
      }

      // Сохраняем обновленную историю
      await new Promise((resolve) => {
        chrome.storage.local.set({ subscriptionHistory: history }, () => {
          resolve();
        });
      });

      console.log(`Threads Auto Follow: [DEBUG] Сохранено в историю: ${username}`);
      
      // Отправляем обновление в popup
      chrome.runtime.sendMessage({
        action: 'historyUpdated',
        history: history
      });

    } catch (error) {
      console.error(`Threads Auto Follow: [ERROR] Ошибка при сохранении в историю:`, error);
    }
  }


  // Запуск парсинга подписчиков
  async startParsing() {
    console.log('Threads Auto Follow: [DEBUG] Начинаем парсинг текущего списка подписчиков');
    
    // Проверяем, есть ли открытое модальное окно
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('Threads Auto Follow: [DEBUG] Модальное окно не найдено, пытаемся открыть список подписчиков');
      
      // Пытаемся открыть список подписчиков
      const listOpened = await this.openFollowersList();
      if (!listOpened) {
        this.showNotification('Не удалось открыть список подписчиков. Убедитесь, что вы находитесь на странице профиля.', 'error');
        this.isParsing = false;
        return;
      }
      
      // Ждем загрузки модального окна
      await this.sleep(2000);
    }
    
    // Устанавливаем флаг парсинга в storage
    await chrome.storage.local.set({
      'parsingInProgress': true,
      'parsingStartTime': Date.now()
    });
    
    // Запускаем парсинг
    await this.parseFollowersFromModal();
  }

  // Парсинг подписчиков из открытого модального окна
  async parseFollowersFromModal() {
    if (!this.isParsing) return;

    console.log('Threads Auto Follow: [DEBUG] Начинаем парсинг подписчиков из модального окна');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
      console.log('Threads Auto Follow: [DEBUG] Модальное окно не найдено');
      return;
    }

    // Диагностика структуры модального окна
    console.log('Threads Auto Follow: [DEBUG] Структура модального окна:');
    console.log('Threads Auto Follow: [DEBUG] - modal.scrollHeight:', modal.scrollHeight);
    console.log('Threads Auto Follow: [DEBUG] - modal.clientHeight:', modal.clientHeight);
    console.log('Threads Auto Follow: [DEBUG] - modal.scrollTop:', modal.scrollTop);
    
    // Ищем правильный прокручиваемый контейнер
    let scrollableContainer = this.findScrollableContainer(modal);
    if (!scrollableContainer) {
      console.log('Threads Auto Follow: [DEBUG] Прокручиваемый контейнер не найден, используем модальное окно');
      scrollableContainer = modal;
    }

    let parsedCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 25; // Увеличено количество попыток
    let lastUserCount = 0;
    let noNewUsersCount = 0; // Счетчик попыток без новых пользователей
    let lastScrollHeight = 0; // Для отслеживания изменений в прокрутке

    // Сначала парсим уже загруженных пользователей
    console.log('Threads Auto Follow: [DEBUG] Парсим уже загруженных пользователей');
    const initialCount = this.parsedUsernames.length;
    this.parseCurrentUsers(modal);
    lastUserCount = this.parsedUsernames.length;
    console.log(`Threads Auto Follow: [DEBUG] Начальное количество пользователей: ${lastUserCount} (добавлено: ${lastUserCount - initialCount})`);
    
    // Пытаемся определить общее количество подписчиков из заголовка модального окна
    let totalFollowers = 0;
    try {
      const followersText = modal.querySelector('h1, h2, h3, [role="heading"]')?.textContent || '';
      const match = followersText.match(/(\d+)\s*подписчик/i);
      if (match) {
        totalFollowers = parseInt(match[1]);
        console.log(`Threads Auto Follow: [DEBUG] Общее количество подписчиков: ${totalFollowers}`);
      }
    } catch (error) {
      console.log('Threads Auto Follow: [DEBUG] Не удалось определить общее количество подписчиков');
    }
    
    // Сохраняем начальный прогресс
    await this.saveParsingProgress(lastUserCount, totalFollowers || 200, 'Парсинг подписчиков...');
    
    // Отправляем начальный прогресс (если popup открыт)
    this.sendProgressUpdate(lastUserCount, totalFollowers || 200, 'Парсинг подписчиков...');

    // Используем более надежный подход с интервалом для работы в фоне
    const parseInterval = setInterval(async () => {
      if (!this.isParsing || scrollAttempts >= maxScrollAttempts) {
        clearInterval(parseInterval);
        return;
      }

      // Проверяем, видима ли страница
      const isPageVisible = !document.hidden;
      console.log(`Threads Auto Follow: [DEBUG] Страница видима: ${isPageVisible}`);

      console.log(`Threads Auto Follow: [DEBUG] Попытка прокрутки ${scrollAttempts + 1}/${maxScrollAttempts}`);
      console.log(`Threads Auto Follow: [DEBUG] scrollHeight: ${scrollableContainer.scrollHeight}, clientHeight: ${scrollableContainer.clientHeight}, scrollTop: ${scrollableContainer.scrollTop}`);
      
      const beforeCount = this.parsedUsernames.length;
      const currentScrollHeight = scrollableContainer.scrollHeight;
      
      // Проверяем, изменилась ли высота прокрутки
      if (currentScrollHeight === lastScrollHeight && scrollAttempts > 0) {
        console.log(`Threads Auto Follow: [DEBUG] Высота прокрутки не изменилась: ${currentScrollHeight}`);
      }
      lastScrollHeight = currentScrollHeight;
      
      // Пробуем разные способы прокрутки в зависимости от попытки и видимости страницы
      if (scrollAttempts < 5) {
        // Способ 1: Прокрутка до конца
        scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
        await this.sleep(isPageVisible ? 2000 : 5000);
      } else if (scrollAttempts < 10) {
        // Способ 2: Пошаговая прокрутка
        for (let i = 0; i < 8; i++) {
          scrollableContainer.scrollTop += 500;
          await this.sleep(isPageVisible ? 800 : 2000);
        }
      } else if (scrollAttempts < 15) {
        // Способ 3: Прокрутка к последнему элементу
        const lastUserElement = modal.querySelector('div[role="button"]:last-child, a[href*="/@"]:last-child');
        if (lastUserElement) {
          lastUserElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
          await this.sleep(isPageVisible ? 2000 : 5000);
        }
      } else if (scrollAttempts < 20) {
        // Способ 4: Агрессивная прокрутка с клавишами
        scrollableContainer.focus();
        for (let i = 0; i < 15; i++) {
          scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
          await this.sleep(300);
        }
        await this.sleep(isPageVisible ? 1500 : 4000);
      } else {
        // Способ 5: Прокрутка колесом мыши
        for (let i = 0; i < 25; i++) {
          scrollableContainer.dispatchEvent(new WheelEvent('wheel', { 
            deltaY: 500, 
            deltaMode: 0 
          }));
          await this.sleep(300);
        }
        await this.sleep(isPageVisible ? 1500 : 4000);
      }
      
      // Парсим новых пользователей после прокрутки
      this.parseCurrentUsers(modal);
      const afterCount = this.parsedUsernames.length;
      const newUsers = afterCount - beforeCount;
      
      console.log(`Threads Auto Follow: [DEBUG] После прокрутки найдено ${newUsers} новых пользователей (было: ${beforeCount}, стало: ${afterCount})`);

      // Проверяем, загрузились ли новые пользователи
      if (newUsers > 0) {
        noNewUsersCount = 0; // Сбрасываем счетчик при успешной загрузке
        lastUserCount = afterCount;
        console.log(`Threads Auto Follow: [DEBUG] Загружены новые пользователи, сбрасываем счетчик`);
        
        // Сохраняем и отправляем обновление прогресса
        await this.saveParsingProgress(afterCount, totalFollowers || 200, `Найдено ${afterCount} пользователей...`);
        this.sendProgressUpdate(afterCount, totalFollowers || 200, `Найдено ${afterCount} пользователей...`);
      } else {
        noNewUsersCount++;
        console.log(`Threads Auto Follow: [DEBUG] Новых пользователей не найдено, счетчик: ${noNewUsersCount}`);
        
        // Проверяем, достигли ли мы конца списка
        const isAtBottom = scrollableContainer.scrollTop + scrollableContainer.clientHeight >= scrollableContainer.scrollHeight - 50;
        const hasMoreContent = scrollableContainer.scrollHeight > scrollableContainer.clientHeight + 100;
        const scrollHeightChanged = currentScrollHeight !== lastScrollHeight;
        
        // Дополнительная проверка: если мы в самом низу И высота не изменилась И нет новых пользователей
        const trulyAtBottom = isAtBottom && !scrollHeightChanged && noNewUsersCount > 15;
        const reachedTotalFollowers = totalFollowers > 0 && afterCount >= totalFollowers;
        
        console.log(`Threads Auto Follow: [DEBUG] isAtBottom: ${isAtBottom}, hasMoreContent: ${hasMoreContent}, scrollHeightChanged: ${scrollHeightChanged}, reachedTotalFollowers: ${reachedTotalFollowers}`);
        
        // Если достигли общего количества подписчиков
        if (reachedTotalFollowers) {
          console.log(`Threads Auto Follow: [DEBUG] Достигнуто общее количество подписчиков (${afterCount}/${totalFollowers}), завершаем парсинг`);
          clearInterval(parseInterval);
          clearInterval(backgroundParseInterval);
          this.isParsing = false;
          
          // Сохраняем финальные данные
          try {
            if (chrome.runtime?.id) {
              await chrome.storage.local.set({
                'parsedUsernames': this.parsedUsernames,
                'parsingCompleted': true,
                'parsingTimestamp': Date.now(),
                'parsingInProgress': false
              });
            }
          } catch (error) {
            console.log('Threads Auto Follow: [DEBUG] Ошибка сохранения финальных данных:', error.message);
          }
          
          // Отправляем собранные данные в popup (если открыт)
          this.sendMessage({
            action: 'parsingCompleted',
            parsedUsernames: this.parsedUsernames,
            count: afterCount
          });
          
          this.showNotification(`Парсинг завершен! Найдено ${afterCount} пользователей`, 'success');
          return;
        }
        
        // Если действительно достигли конца списка
        if (trulyAtBottom) {
          console.log(`Threads Auto Follow: [DEBUG] Достигнут конец списка (внизу: ${isAtBottom}, высота не изменилась: ${!scrollHeightChanged}, попыток без новых: ${noNewUsersCount})`);
          clearInterval(parseInterval);
          clearInterval(backgroundParseInterval);
          this.isParsing = false;
          
          // Сохраняем финальные данные
          try {
            if (chrome.runtime?.id) {
              await chrome.storage.local.set({
                'parsedUsernames': this.parsedUsernames,
                'parsingCompleted': true,
                'parsingTimestamp': Date.now(),
                'parsingInProgress': false
              });
            }
          } catch (error) {
            console.log('Threads Auto Follow: [DEBUG] Ошибка сохранения финальных данных:', error.message);
          }
          
          // Отправляем собранные данные в popup (если открыт)
          this.sendMessage({
            action: 'parsingCompleted',
            parsedUsernames: this.parsedUsernames,
            count: afterCount
          });
          
          this.showNotification(`Парсинг завершен! Найдено ${afterCount} пользователей`, 'success');
          return;
        }
        
        // Если много попыток без результата, попробуем более агрессивный подход
        if (noNewUsersCount > 15 && !scrollHeightChanged) {
          console.log(`Threads Auto Follow: [DEBUG] Много попыток без результата (${noNewUsersCount}), пробуем агрессивный подход`);
          
          // Очень агрессивная прокрутка
          for (let i = 0; i < 50; i++) {
            scrollableContainer.dispatchEvent(new WheelEvent('wheel', { 
              deltaY: 2000, 
              deltaMode: 0 
            }));
            await this.sleep(30);
          }
          
          // Прокрутка клавишами
          scrollableContainer.focus();
          for (let i = 0; i < 50; i++) {
            scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
            await this.sleep(30);
          }
          
          // Дополнительная прокрутка стрелками
          for (let i = 0; i < 100; i++) {
            scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            await this.sleep(20);
          }
          
          // Прокрутка до конца
          scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
          await this.sleep(2000);
          
          // Дополнительная прокрутка стрелками
          for (let i = 0; i < 50; i++) {
            scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            await this.sleep(30);
          }
          
          // Еще одна прокрутка до конца
          scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
          await this.sleep(2000);
        }
        
        // Если очень много попыток без результата, завершаем парсинг
        if (noNewUsersCount > 100) {
          console.log(`Threads Auto Follow: [DEBUG] Очень много попыток без результата (${noNewUsersCount}), завершаем парсинг`);
          clearInterval(parseInterval);
          clearInterval(backgroundParseInterval);
          this.isParsing = false;
          
          // Сохраняем финальные данные
          try {
            if (chrome.runtime?.id) {
              await chrome.storage.local.set({
                'parsedUsernames': this.parsedUsernames,
                'parsingCompleted': true,
                'parsingTimestamp': Date.now(),
                'parsingInProgress': false
              });
            }
          } catch (error) {
            console.log('Threads Auto Follow: [DEBUG] Ошибка сохранения финальных данных:', error.message);
          }
          
          // Отправляем собранные данные в popup (если открыт)
          this.sendMessage({
            action: 'parsingCompleted',
            parsedUsernames: this.parsedUsernames,
            count: afterCount
          });
          
          this.showNotification(`Парсинг завершен! Найдено ${afterCount} пользователей`, 'success');
          return;
        }
        
        // Если много попыток без результата И высота прокрутки не изменилась, возможно список действительно закончился
        if (noNewUsersCount > 60 && !scrollHeightChanged) {
          console.log(`Threads Auto Follow: [DEBUG] Много попыток без результата (${noNewUsersCount}) и высота не изменилась, возможно список закончился`);
          clearInterval(parseInterval);
          clearInterval(backgroundParseInterval);
          this.isParsing = false;
          
          // Сохраняем финальные данные
          const finalCount = this.parsedUsernames.length;
          console.log(`Threads Auto Follow: [DEBUG] Парсинг завершен. Найдено ${finalCount} уникальных пользователей`);
          
          // Сохраняем собранные данные в storage
          try {
            if (chrome.runtime?.id) {
              await chrome.storage.local.set({
                'parsedUsernames': this.parsedUsernames,
                'parsingCompleted': true,
                'parsingTimestamp': Date.now(),
                'parsingInProgress': false
              });
            }
          } catch (error) {
            console.log('Threads Auto Follow: [DEBUG] Ошибка сохранения финальных данных:', error.message);
          }
          
          // Отправляем собранные данные в popup (если открыт)
          this.sendMessage({
            action: 'parsingCompleted',
            parsedUsernames: this.parsedUsernames,
            count: finalCount
          });
          
          this.showNotification(`Парсинг завершен! Найдено ${finalCount} пользователей`, 'success');
          return;
        }
        
        // Дополнительная проверка: если достигли общего количества подписчиков
        if (totalFollowers > 0 && this.parsedUsernames.length >= totalFollowers) {
          console.log(`Threads Auto Follow: [DEBUG] Достигнуто общее количество подписчиков (${this.parsedUsernames.length}/${totalFollowers})`);
          clearInterval(parseInterval);
          clearInterval(backgroundParseInterval);
          this.isParsing = false;
          
          // Сохраняем финальные данные
          const finalCount = this.parsedUsernames.length;
          console.log(`Threads Auto Follow: [DEBUG] Парсинг завершен. Найдено ${finalCount} уникальных пользователей`);
          
          // Сохраняем собранные данные в storage
          try {
            if (chrome.runtime?.id) {
              await chrome.storage.local.set({
                'parsedUsernames': this.parsedUsernames,
                'parsingCompleted': true,
                'parsingTimestamp': Date.now(),
                'parsingInProgress': false
              });
            }
          } catch (error) {
            console.log('Threads Auto Follow: [DEBUG] Ошибка сохранения финальных данных:', error.message);
          }
          
          // Отправляем собранные данные в popup (если открыт)
          this.sendMessage({
            action: 'parsingCompleted',
            parsedUsernames: this.parsedUsernames,
            count: finalCount
          });
          
          this.showNotification(`Парсинг завершен! Найдено ${finalCount} пользователей`, 'success');
          return;
        }
      }
      
      scrollAttempts++;
    }, 3000); // Интервал 3 секунды для работы в фоне

    // Дополнительный механизм для работы в фоне - используем более агрессивный подход
    let backgroundParseCount = 0;
    const backgroundParseInterval = setInterval(async () => {
      if (!this.isParsing) {
        clearInterval(backgroundParseInterval);
        return;
      }
      
      backgroundParseCount++;
      console.log(`Threads Auto Follow: [DEBUG] Фоновый парсинг попытка ${backgroundParseCount}`);
      
      // Если страница не видима, используем более агрессивный подход
      if (document.hidden) {
        console.log('Threads Auto Follow: [DEBUG] Страница скрыта, используем агрессивный фоновый парсинг');
        
        // Очень агрессивная прокрутка до конца
        scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
        await this.sleep(3000);
        
        // Множественная прокрутка колесом мыши
        for (let i = 0; i < 30; i++) {
          scrollableContainer.dispatchEvent(new WheelEvent('wheel', { 
            deltaY: 1500, 
            deltaMode: 0 
          }));
          await this.sleep(100);
        }
        
        // Дополнительная прокрутка клавишами
        for (let i = 0; i < 20; i++) {
          scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { 
            key: 'PageDown',
            code: 'PageDown'
          }));
          await this.sleep(100);
        }
        
        // Еще одна прокрутка стрелками
        for (let i = 0; i < 30; i++) {
          scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { 
            key: 'ArrowDown',
            code: 'ArrowDown'
          }));
          await this.sleep(50);
        }
        
        // Дополнительная прокрутка клавишами
        scrollableContainer.focus();
        for (let i = 0; i < 20; i++) {
          scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
          await this.sleep(100);
        }
        
        // Прокрутка стрелками
        for (let i = 0; i < 30; i++) {
          scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
          await this.sleep(50);
        }
        
        // Еще одна прокрутка до конца
        scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
        await this.sleep(2000);
        
        // Парсим пользователей несколько раз
        const beforeCount = this.parsedUsernames.length;
        for (let i = 0; i < 5; i++) {
        this.parseCurrentUsers(modal);
          await this.sleep(500);
        }
        const afterCount = this.parsedUsernames.length;
        
        if (afterCount > beforeCount) {
          console.log(`Threads Auto Follow: [DEBUG] Фоновый парсинг нашел ${afterCount - beforeCount} новых пользователей`);
          await this.saveParsingProgress(afterCount, totalFollowers || 200, `Фоновый парсинг: ${afterCount} пользователей...`);
          this.sendProgressUpdate(afterCount, totalFollowers || 200, `Фоновый парсинг: ${afterCount} пользователей...`);
        }
        
        // Проверяем, достигли ли общего количества подписчиков
        if (totalFollowers > 0 && afterCount >= totalFollowers) {
          console.log(`Threads Auto Follow: [DEBUG] Фоновый парсинг: достигнуто общее количество подписчиков (${afterCount}/${totalFollowers})`);
          clearInterval(backgroundParseInterval);
          clearInterval(parseInterval);
          this.isParsing = false;
          
          // Сохраняем финальные данные
          try {
            if (chrome.runtime?.id) {
              await chrome.storage.local.set({
                'parsedUsernames': this.parsedUsernames,
                'parsingCompleted': true,
                'parsingTimestamp': Date.now(),
                'parsingInProgress': false
              });
            }
          } catch (error) {
            console.log('Threads Auto Follow: [DEBUG] Ошибка сохранения финальных данных:', error.message);
          }
          
          // Отправляем собранные данные в popup (если открыт)
          this.sendMessage({
            action: 'parsingCompleted',
            parsedUsernames: this.parsedUsernames,
            count: afterCount
          });
          
          this.showNotification(`Парсинг завершен! Найдено ${afterCount} пользователей`, 'success');
          return;
        }
        
        // Дополнительная проверка: если много попыток без новых пользователей
        if (backgroundParseCount > 100 && afterCount === beforeCount) {
          console.log(`Threads Auto Follow: [DEBUG] Фоновый парсинг: много попыток без новых пользователей (${backgroundParseCount}), завершаем`);
          clearInterval(backgroundParseInterval);
          clearInterval(parseInterval);
          this.isParsing = false;
          
          // Сохраняем финальные данные
          try {
            if (chrome.runtime?.id) {
              await chrome.storage.local.set({
                'parsedUsernames': this.parsedUsernames,
                'parsingCompleted': true,
                'parsingTimestamp': Date.now(),
                'parsingInProgress': false
              });
            }
          } catch (error) {
            console.log('Threads Auto Follow: [DEBUG] Ошибка сохранения финальных данных:', error.message);
          }
          
          // Отправляем собранные данные в popup (если открыт)
          this.sendMessage({
            action: 'parsingCompleted',
            parsedUsernames: this.parsedUsernames,
            count: afterCount
          });
          
          this.showNotification(`Парсинг завершен! Найдено ${afterCount} пользователей`, 'success');
          return;
        }
      }
    }, 3000); // Каждые 3 секунды

    // Ждем завершения интервала или устанавливаем таймаут
    const maxWaitTime = 300000; // 5 минут максимум
    const startTime = Date.now();
    
    // Проверяем каждые 5 секунд, завершился ли парсинг
    const checkInterval = setInterval(async () => {
      if (!this.isParsing || Date.now() - startTime > maxWaitTime) {
        clearInterval(checkInterval);
        clearInterval(parseInterval);
        clearInterval(backgroundParseInterval);
        this.isParsing = false;
        
        // Финальная попытка загрузки всех пользователей
        console.log(`Threads Auto Follow: [DEBUG] Финальная попытка загрузки всех пользователей`);
        
        // Очень агрессивная финальная прокрутка
        for (let i = 0; i < 50; i++) {
          scrollableContainer.dispatchEvent(new WheelEvent('wheel', { 
            deltaY: 2000, 
            deltaMode: 0 
          }));
          await this.sleep(20);
        }
        
        // Прокрутка клавишами
        scrollableContainer.focus();
        for (let i = 0; i < 50; i++) {
          scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
          await this.sleep(20);
        }
        
        // Прокрутка стрелками
        for (let i = 0; i < 100; i++) {
          scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
          await this.sleep(10);
        }
        
        // Финальная прокрутка до самого конца
        scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
        await this.sleep(3000);
        
        // Очень агрессивная финальная прокрутка
        for (let i = 0; i < 50; i++) {
          scrollableContainer.dispatchEvent(new WheelEvent('wheel', { 
            deltaY: 2000, 
            deltaMode: 0 
          }));
          await this.sleep(50);
        }
        
        // Финальная прокрутка клавишами
        for (let i = 0; i < 50; i++) {
          scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
          await this.sleep(50);
        }
        
        // Еще одна прокрутка стрелками
        for (let i = 0; i < 100; i++) {
          scrollableContainer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
          await this.sleep(30);
        }
        
        // Финальная прокрутка до конца
        scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
        await this.sleep(5000);
        
        // Парсим пользователей несколько раз
        for (let i = 0; i < 5; i++) {
        this.parseCurrentUsers(modal);
          await this.sleep(1000);
        }
        
        const parsedCount = this.parsedUsernames.length;
        console.log(`Threads Auto Follow: [DEBUG] Парсинг завершен. Найдено ${parsedCount} уникальных пользователей`);
        
        // Сохраняем финальный прогресс
        await this.saveParsingProgress(parsedCount, 200, 'Парсинг завершен!');
        
        // Отправляем финальный прогресс (если popup открыт)
        this.sendProgressUpdate(parsedCount, 200, 'Парсинг завершен!');
        
        this.showNotification(`Парсинг завершен! Найдено ${parsedCount} пользователей`, 'success');
        
        // Сохраняем собранные данные в storage
        try {
          if (chrome.runtime?.id) {
            await chrome.storage.local.set({
              'parsedUsernames': this.parsedUsernames,
              'parsingCompleted': true,
              'parsingTimestamp': Date.now(),
              'parsingInProgress': false
            });
          }
        } catch (error) {
          console.log('Threads Auto Follow: [DEBUG] Ошибка сохранения финальных данных:', error.message);
        }
        
        // Отправляем собранные данные в popup (если открыт)
        this.sendMessage({
          action: 'parsingCompleted',
          parsedUsernames: this.parsedUsernames,
          count: parsedCount
        });
      }
    }, 5000);
  }

  // Сохранение прогресса парсинга в storage
  async saveParsingProgress(current, total, status) {
    try {
      // Проверяем, что расширение еще активно
      if (!chrome.runtime?.id) {
        console.log('Threads Auto Follow: [DEBUG] Расширение неактивно, пропускаем сохранение');
        return;
      }
      
      await chrome.storage.local.set({
        'parsingProgress': {
          current: current,
          total: total,
          status: status,
          timestamp: Date.now()
        },
        'parsingInProgress': true
      });
    } catch (error) {
      console.error('Threads Auto Follow: [ERROR] Ошибка сохранения прогресса:', error);
      // Если контекст недействителен, останавливаем парсинг
      if (error.message.includes('Extension context invalidated')) {
        console.log('Threads Auto Follow: [DEBUG] Контекст расширения недействителен, останавливаем парсинг');
        this.stopParsing();
      }
    }
  }

  // Остановка парсинга
  stopParsing() {
    console.log('Threads Auto Follow: [DEBUG] Останавливаем парсинг');
    
    // Очищаем все интервалы
    if (this.parseInterval) {
      clearInterval(this.parseInterval);
      this.parseInterval = null;
    }
    
    if (this.backgroundParseInterval) {
      clearInterval(this.backgroundParseInterval);
      this.backgroundParseInterval = null;
    }
    
    // Сбрасываем состояние
    this.isParsing = false;
    this.parsedUsernames = [];
    
    // Очищаем storage
    try {
      if (chrome.runtime?.id) {
        chrome.storage.local.remove(['parsingInProgress', 'parsingProgress']);
      }
    } catch (error) {
      console.log('Threads Auto Follow: [DEBUG] Ошибка очистки storage:', error.message);
    }
    
    console.log('Threads Auto Follow: [DEBUG] Парсинг остановлен');
  }

  // Безопасная отправка сообщений в popup
  sendMessage(message) {
    try {
      if (!chrome.runtime?.id) {
        console.log('Threads Auto Follow: [DEBUG] Расширение неактивно, пропускаем отправку сообщения');
        return;
      }
      
      chrome.runtime.sendMessage(message).catch(error => {
        // Игнорируем ошибки, если popup закрыт
        console.log('Threads Auto Follow: [DEBUG] Popup закрыт, сообщение не отправлено');
      });
    } catch (error) {
      console.log('Threads Auto Follow: [DEBUG] Ошибка отправки сообщения:', error);
    }
  }

  // Отправка обновления прогресса
  sendProgressUpdate(current, total, status) {
    this.sendMessage({
      action: 'parsingProgress',
      current: current,
      total: total,
      status: status
    });
  }

  // Настройка обработчика видимости страницы для работы в фоне
  setupVisibilityHandler() {
    // Обработчик изменения видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('Threads Auto Follow: [DEBUG] Страница скрыта, парсинг продолжается в фоне');
      } else {
        console.log('Threads Auto Follow: [DEBUG] Страница видима, парсинг активен');
      }
    });

    // Обработчик фокуса/потери фокуса окна
    window.addEventListener('blur', () => {
      console.log('Threads Auto Follow: [DEBUG] Окно потеряло фокус, парсинг продолжается в фоне');
    });

    window.addEventListener('focus', () => {
      console.log('Threads Auto Follow: [DEBUG] Окно получило фокус, парсинг активен');
    });
  }

  // Поиск прокручиваемого контейнера в модальном окне
  findScrollableContainer(modal) {
    console.log('Threads Auto Follow: [DEBUG] Поиск прокручиваемого контейнера...');
    
    // Ищем все элементы с возможной прокруткой
    const allElements = modal.querySelectorAll('*');
    let bestContainer = null;
    let maxScrollHeight = 0;
    
    for (const element of allElements) {
      const style = window.getComputedStyle(element);
      const hasScroll = style.overflow === 'auto' || style.overflow === 'scroll' || 
                       style.overflowY === 'auto' || style.overflowY === 'scroll';
      
      if (hasScroll && element.scrollHeight > element.clientHeight) {
        console.log(`Threads Auto Follow: [DEBUG] Найден прокручиваемый элемент:`, element);
        console.log(`Threads Auto Follow: [DEBUG] - scrollHeight: ${element.scrollHeight}, clientHeight: ${element.clientHeight}`);
        
        // Выбираем элемент с наибольшей высотой прокрутки
        if (element.scrollHeight > maxScrollHeight) {
          maxScrollHeight = element.scrollHeight;
          bestContainer = element;
        }
      }
    }
    
    if (bestContainer) {
      console.log(`Threads Auto Follow: [DEBUG] Выбран лучший контейнер с scrollHeight: ${bestContainer.scrollHeight}`);
    }
    
    return bestContainer;
  }

  // Парсинг текущих пользователей в модальном окне
  parseCurrentUsers(modal) {
    const initialCount = this.parsedUsernames.length;
    
    // 1. Основной поиск по ссылкам (самый надежный способ)
    const allLinks = modal.querySelectorAll('a[href*="/@"]');
    console.log(`Threads Auto Follow: [DEBUG] Найдено ${allLinks.length} ссылок на профили`);
    
    for (const link of allLinks) {
      const href = link.getAttribute('href');
      if (href && href.includes('/@')) {
        const match = href.match(/\/@([^\/\?]+)/);
        if (match) {
          const username = match[1];
          if (this.isValidUsername(username)) {
            if (!this.parsedUsernames.includes(username)) {
              this.parsedUsernames.push(username);
              console.log(`Threads Auto Follow: [DEBUG] Найден новый пользователь из ссылки: ${username}`);
            }
          }
        }
      }
    }

    // 2. Поиск по элементам с role="button" (исключаем заголовки)
    const buttonElements = modal.querySelectorAll('div[role="button"]');
    console.log(`Threads Auto Follow: [DEBUG] Найдено ${buttonElements.length} элементов с role="button"`);
    
    for (const element of buttonElements) {
      // Исключаем элементы с текстом "Подписчики", "Подписки" и числами
      const text = element.textContent?.toLowerCase() || '';
      if (text.includes('подписчик') || text.includes('подписк') || text.includes('followers') || text.includes('following') || /^\d+$/.test(text.trim())) {
        continue;
      }
      
      const username = this.extractUsernameFromElement(element);
      if (username && this.isValidUsername(username)) {
        if (!this.parsedUsernames.includes(username)) {
          this.parsedUsernames.push(username);
          console.log(`Threads Auto Follow: [DEBUG] Найден новый пользователь из кнопки: ${username}`);
        }
      }
    }

    // 3. Поиск по другим селекторам
    const userSelectors = [
      'div[data-testid*="user"]',
      'div[class*="user"]',
      'div[class*="profile"]',
      'div[class*="follow"]',
      'div[class*="account"]',
      'div[class*="avatar"]',
      'div[class*="name"]'
    ];

    for (const selector of userSelectors) {
      const elements = modal.querySelectorAll(selector);
      console.log(`Threads Auto Follow: [DEBUG] Найдено ${elements.length} элементов с селектором: ${selector}`);
      
      for (const element of elements) {
        const username = this.extractUsernameFromElement(element);
        if (username && this.isValidUsername(username)) {
          if (!this.parsedUsernames.includes(username)) {
            this.parsedUsernames.push(username);
            console.log(`Threads Auto Follow: [DEBUG] Найден новый пользователь из ${selector}: ${username}`);
          }
        }
      }
    }

    // 4. Поиск по тексту в модальном окне
    const textContent = modal.textContent || '';
    const lines = textContent.split('\n').map(line => line.trim()).filter(line => line);
    
    for (const line of lines) {
      // Ищем строки, которые могут содержать username
      const cleanLine = line.replace(/[^\w._@]/g, '');
      
      if (cleanLine.startsWith('@')) {
        const username = cleanLine.substring(1);
        if (this.isValidUsername(username) && !this.parsedUsernames.includes(username)) {
          this.parsedUsernames.push(username);
          console.log(`Threads Auto Follow: [DEBUG] Найден новый пользователь из текста с @: ${username}`);
        }
      } else if (this.isValidUsername(cleanLine) && !this.parsedUsernames.includes(cleanLine)) {
        this.parsedUsernames.push(cleanLine);
        console.log(`Threads Auto Follow: [DEBUG] Найден новый пользователь из текста: ${cleanLine}`);
      }
    }

    const finalCount = this.parsedUsernames.length;
    const newUsers = finalCount - initialCount;
    console.log(`Threads Auto Follow: [DEBUG] Добавлено ${newUsers} новых пользователей (было: ${initialCount}, стало: ${finalCount})`);
  }

  // Извлечение username из элемента
  extractUsernameFromElement(element) {
    try {
      // 1. Ищем ссылку на профиль в самом элементе
      const profileLink = element.querySelector('a[href*="/@"]');
      if (profileLink) {
        const href = profileLink.getAttribute('href');
        const match = href.match(/\/@([^\/\?]+)/);
        if (match) {
          console.log(`Threads Auto Follow: [DEBUG] Найден username из ссылки: ${match[1]}`);
          return match[1];
        }
      }

      // 2. Ищем в родительских элементах (до 5 уровней)
      let parent = element.parentElement;
      for (let i = 0; i < 5 && parent; i++) {
        const parentLink = parent.querySelector('a[href*="/@"]');
        if (parentLink) {
          const href = parentLink.getAttribute('href');
          const match = href.match(/\/@([^\/\?]+)/);
          if (match) {
            console.log(`Threads Auto Follow: [DEBUG] Найден username из родительской ссылки: ${match[1]}`);
            return match[1];
          }
        }
        parent = parent.parentElement;
      }

      // 3. Поиск по тексту элемента
      const textContent = element.textContent || '';
      const lines = textContent.split('\n').map(line => line.trim()).filter(line => line);
      
      for (const line of lines) {
        // Убираем лишние символы, но сохраняем @
        const cleanLine = line.replace(/[^\w._@]/g, '');
        
        if (cleanLine.startsWith('@')) {
          const username = cleanLine.substring(1);
          if (this.isValidUsername(username)) {
            console.log(`Threads Auto Follow: [DEBUG] Найден username с @: ${username}`);
            return username;
          }
        }
        
        // Проверяем, является ли строка username
        if (this.isValidUsername(cleanLine)) {
          console.log(`Threads Auto Follow: [DEBUG] Найден username: ${cleanLine}`);
          return cleanLine;
        }
      }

      // 4. Поиск в дочерних элементах
      const childLinks = element.querySelectorAll('a[href*="/@"]');
      for (const link of childLinks) {
        const href = link.getAttribute('href');
        const match = href.match(/\/@([^\/\?]+)/);
        if (match) {
          console.log(`Threads Auto Follow: [DEBUG] Найден username из дочерней ссылки: ${match[1]}`);
          return match[1];
        }
      }

      // 5. Поиск по атрибутам элемента
      const href = element.getAttribute('href');
      if (href && href.includes('/@')) {
        const match = href.match(/\/@([^\/\?]+)/);
        if (match) {
          console.log(`Threads Auto Follow: [DEBUG] Найден username из атрибута href: ${match[1]}`);
          return match[1];
        }
      }

      // 6. Поиск по data-атрибутам
      const dataAttrs = ['data-username', 'data-user', 'data-profile', 'data-account'];
      for (const attr of dataAttrs) {
        const value = element.getAttribute(attr);
        if (value && this.isValidUsername(value)) {
          console.log(`Threads Auto Follow: [DEBUG] Найден username из атрибута ${attr}: ${value}`);
          return value;
        }
      }

    } catch (error) {
      console.error('Threads Auto Follow: [ERROR] Ошибка при извлечении username:', error);
    }
    
    return null;
  }

  // Проверка валидности username
  isValidUsername(username) {
    if (!username || username.length < 2 || username.length > 30) {
      return false;
    }
    
    // Username должен содержать только буквы, цифры, точки и подчеркивания
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      return false;
    }
    
    // Исключаем общие слова и числа
    const excludeWords = [
      'followers', 'following', 'подписчики', 'подписки', 'subscribe', 'подписаться', 
      'follow', 'follows', 'threads', 'instagram', 'meta', 'facebook', 'profile', 'user',
      'account', 'name', 'avatar', 'photo', 'image', 'picture', 'pic', 'img'
    ];
    
    if (excludeWords.includes(username.toLowerCase())) {
      return false;
    }
    
    // Исключаем чисто числовые username (кроме случаев с точками/подчеркиваниями)
    if (/^\d+$/.test(username)) {
      return false;
    }
    
    // Исключаем слишком короткие username
    if (username.length < 3) {
      return false;
    }
    
    // Исключаем username, которые начинаются или заканчиваются точкой
    if (username.startsWith('.') || username.endsWith('.')) {
      return false;
    }
    
    // Исключаем username с несколькими точками подряд
    if (username.includes('..')) {
      return false;
    }
    
    // Исключаем username, которые выглядят как системные
    if (username.toLowerCase().includes('system') || username.toLowerCase().includes('admin')) {
      return false;
    }
    
    return true;
  }

  // Продолжение работы со списком пользователей после перезагрузки страницы
  async continueFollowingUsersFromList() {
    console.log(`Threads Auto Follow: [DEBUG] Продолжаем работу со списком пользователей`);
    console.log(`Threads Auto Follow: [DEBUG] Текущий пользователь: ${this.currentUsername}`);
    console.log(`Threads Auto Follow: [DEBUG] Текущий индекс: ${this.currentUserIndex}`);
    
    // Ждем загрузки страницы
    await this.sleep(3000);
    
    // Проверяем, что мы на правильной странице
    const currentUrl = window.location.href;
    console.log(`Threads Auto Follow: [DEBUG] Текущий URL: ${currentUrl}`);
    
    if (this.currentUsername && currentUrl.includes(`@${this.currentUsername}`)) {
      // Мы на правильной странице, продолжаем подписку
      console.log(`Threads Auto Follow: [DEBUG] Продолжаем подписку на ${this.currentUsername}`);
      
      // Ждем еще немного для полной загрузки
      await this.sleep(2000);
      
      // Проверяем, подписаны ли мы уже на этого пользователя
      if (this.isAlreadySubscribed()) {
        console.log(`Threads Auto Follow: [DEBUG] Уже подписаны на ${this.currentUsername}, добавляем в игнор-список`);
        this.addToIgnoreList(this.currentUsername);
        
        // Удаляем пользователя из списка пользователей, так как он уже обработан
        this.removeFromUserList(this.currentUsername);
        
        // Переходим к следующему пользователю
        this.currentUserIndex++;
        this.currentUsername = '';
        
        if (this.currentUserIndex < this.userList.length) {
          const nextUsername = this.userList[this.currentUserIndex];
          this.currentUsername = nextUsername;
          
          console.log(`Threads Auto Follow: [DEBUG] Переходим к следующему пользователю: ${nextUsername}`);
          this.saveState();
          
          const profileUrl = `https://www.threads.net/@${nextUsername}`;
          window.location.href = profileUrl;
        } else {
          console.log(`Threads Auto Follow: [DEBUG] Завершена подписка на всех пользователей из списка`);
          this.showNotification(`Подписка завершена! Подписано на ${this.subscribedCount} пользователей`, 'success');
          this.isRunning = false;
          this.isFollowingUsersFromList = false;
          this.updateStatus();
          this.clearState();
        }
        return;
      }
      
      // Проверяем, находится ли пользователь в игнор-списке
      if (this.isUserInIgnoreList(this.currentUsername)) {
        console.log(`Threads Auto Follow: [DEBUG] Пользователь ${this.currentUsername} находится в игнор-списке, пропускаем`);
        
        // Удаляем пользователя из списка пользователей, так как он в игнор-списке
        this.removeFromUserList(this.currentUsername);
        
        // Переходим к следующему пользователю
        this.currentUserIndex++;
        this.currentUsername = '';
        
        if (this.currentUserIndex < this.userList.length) {
          const nextUsername = this.userList[this.currentUserIndex];
          this.currentUsername = nextUsername;
          
          console.log(`Threads Auto Follow: [DEBUG] Переходим к следующему пользователю: ${nextUsername}`);
          this.saveState();
          
          const profileUrl = `https://www.threads.net/@${nextUsername}`;
          window.location.href = profileUrl;
        } else {
          console.log(`Threads Auto Follow: [DEBUG] Завершена подписка на всех пользователей из списка`);
          this.showNotification(`Подписка завершена! Подписано на ${this.subscribedCount} пользователей`, 'success');
          this.isRunning = false;
          this.isFollowingUsersFromList = false;
          this.updateStatus();
          this.clearState();
        }
        return;
      }
      
      // Ищем кнопку подписки
      const subscribeButton = this.findSubscribeButtonOnProfile();
      
      if (subscribeButton) {
        console.log(`Threads Auto Follow: [DEBUG] Найдена кнопка подписки для ${this.currentUsername}:`, subscribeButton);
        
        const buttonText = subscribeButton.textContent?.toLowerCase() || '';
        console.log(`Threads Auto Follow: [DEBUG] Текст кнопки: "${buttonText}"`);
        
        if (buttonText.includes('подписаться') || buttonText.includes('follow')) {
          // Проверяем лимит подписок
          if (this.subscribedCount >= this.targetCount) {
            console.log(`Threads Auto Follow: [DEBUG] Достигнут лимит подписок (${this.subscribedCount}/${this.targetCount}), завершаем`);
            this.showNotification(`Достигнут лимит подписок! Подписано на ${this.subscribedCount} пользователей`, 'success');
            this.isRunning = false;
            this.isFollowingUsersFromList = false;
            this.updateStatus();
            this.clearState();
            return;
          }
          
          console.log(`Threads Auto Follow: [DEBUG] Нажимаем кнопку подписки для ${this.currentUsername}`);
          subscribeButton.click();
          
          await this.sleep(1000);
          
          console.log(`Threads Auto Follow: [DEBUG] Подписались на ${this.currentUsername}`);
          this.subscribedCount++;
          this.updateStatus();
          
          // Добавляем пользователя в игнор-список, чтобы не подписываться на него снова
          this.addToIgnoreList(this.currentUsername);
          
          // Удаляем пользователя из списка пользователей, так как он уже обработан
          this.removeFromUserList(this.currentUsername);
          
          // Сохраняем в историю подписок
          await this.saveToHistory(this.currentUsername, 'Подписан по списку пользователей');
          
          // Сохраняем состояние
          this.saveState();
          
          // Проверяем, достигли ли лимита после подписки
          if (this.subscribedCount >= this.targetCount) {
            console.log(`Threads Auto Follow: [DEBUG] Достигнут лимит подписок после подписки (${this.subscribedCount}/${this.targetCount}), завершаем`);
            this.showNotification(`Достигнут лимит подписок! Подписано на ${this.subscribedCount} пользователей`, 'success');
            this.isRunning = false;
            this.isFollowingUsersFromList = false;
            this.updateStatus();
            this.clearState();
            return;
          }
          
          // Ждем между подписками
          const delay = this.getRandomDelay();
          console.log(`Threads Auto Follow: [DEBUG] Случайная задержка: ${delay}мс (${delay/1000}с)`);
          await this.sleep(delay);
        } else {
          console.log(`Threads Auto Follow: [DEBUG] Уже подписаны на ${this.currentUsername} или кнопка недоступна`);
        }
      } else {
        console.log(`Threads Auto Follow: [DEBUG] Кнопка подписки не найдена для ${this.currentUsername}`);
        this.addToIgnoreList(this.currentUsername);
      }
      
      // Переходим к следующему пользователю
      this.currentUserIndex++;
      this.currentUsername = '';
      
      // Проверяем лимит перед переходом к следующему пользователю
      if (this.subscribedCount >= this.targetCount) {
        console.log(`Threads Auto Follow: [DEBUG] Достигнут лимит подписок (${this.subscribedCount}/${this.targetCount}), завершаем`);
        this.showNotification(`Достигнут лимит подписок! Подписано на ${this.subscribedCount} пользователей`, 'success');
        this.isRunning = false;
        this.isFollowingUsersFromList = false;
        this.updateStatus();
        this.clearState();
        return;
      }
      
      if (this.currentUserIndex < this.userList.length) {
        // Есть еще пользователи
        const nextUsername = this.userList[this.currentUserIndex];
        this.currentUsername = nextUsername;
        
        console.log(`Threads Auto Follow: [DEBUG] Переходим к следующему пользователю: ${nextUsername}`);
        
        // Сохраняем состояние перед переходом
        this.saveState();
        
        // Переходим на профиль следующего пользователя
        const profileUrl = `https://www.threads.net/@${nextUsername}`;
        window.location.href = profileUrl;
      } else {
        // Завершили работу со списком
        console.log(`Threads Auto Follow: [DEBUG] Завершена подписка на всех пользователей из списка`);
        this.showNotification(`Подписка завершена! Подписано на ${this.subscribedCount} пользователей`, 'success');
        this.isRunning = false;
        this.isFollowingUsersFromList = false;
        this.updateStatus();
        this.clearState();
      }
    } else {
      // Мы не на правильной странице, переходим к текущему пользователю
      if (this.currentUserIndex < this.userList.length) {
        const username = this.userList[this.currentUserIndex];
        this.currentUsername = username;
        
        console.log(`Threads Auto Follow: [DEBUG] Переходим к пользователю: ${username}`);
        
        // Сохраняем состояние перед переходом
        this.saveState();
        
        // Переходим на профиль пользователя
        const profileUrl = `https://www.threads.net/@${username}`;
        window.location.href = profileUrl;
      } else {
        // Завершили работу
        console.log(`Threads Auto Follow: [DEBUG] Завершена подписка на всех пользователей из списка`);
        this.showNotification(`Подписка завершена! Подписано на ${this.subscribedCount} пользователей`, 'success');
        this.isRunning = false;
        this.isFollowingUsersFromList = false;
        this.updateStatus();
        this.clearState();
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
      console.log('Threads Auto Follow: [DEBUG] DOM загружен, инициализируем скрипт');
      window.threadsAutoFollow = new ThreadsAutoFollow();
    });
  } else {
    console.log('Threads Auto Follow: [DEBUG] DOM уже загружен, инициализируем скрипт');
    window.threadsAutoFollow = new ThreadsAutoFollow();
  }
  
  // Отправляем сигнал о готовности
  setTimeout(() => {
    console.log('Threads Auto Follow: [DEBUG] Content script готов к работе');
  }, 1000);
}
