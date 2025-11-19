// ThreadsAI Settings Page Script

// Settings page translations
const settingsTranslations = {
    en: {
        title: "ThreadsAI - Extended Automation Settings",
        subtitle: "Extended automation settings",
        
        // Main sections
        stats: "📊 Statistics",
        basicSettings: "⚙️ Basic Settings",
        aiSettings: "🤖 AI Settings",
        postFiltering: "🔍 Post Filtering",
        userFiltering: "👤 User Filtering", 
        languageFiltering: "🌐 Language Filtering",
        keywordSearch: "🔎 Keyword Search",
        exportImport: "💾 Export/Import",
        
        // Statistics
        totalComments: "Total comments",
        totalLikes: "Total likes", 
        sessionsCount: "Sessions",
        avgPerHour: "Per hour (average)",
        
        // Basic settings
        maxPosts: "Maximum posts",
        maxPostsDesc: "Number of posts to process per session",
        delayBetweenActions: "Delay between actions",
        delayDesc: "Random delay in seconds",
        autoLikes: "Auto likes",
        autoLikesDesc: "Automatically like posts",
        stealthMode: "Stealth mode",
        stealthModeDesc: "Simulate typing and human behavior",
        respectLimits: "Respect limits",
        respectLimitsDesc: "Automatic pause when limits are reached",
        actionsPerHour: "Actions per hour",
        actionsPerHourDesc: "Maximum actions for safe operation",
        avoidDuplicatePosts: "Avoid duplicate posts",
        avoidDuplicatePostsDesc: "Don't comment on posts repeatedly (uses ignore list)",
        avoidDuplicateUsers: "Avoid duplicate users",
        avoidDuplicateUsersDesc: "Don't comment on posts from users already commented on",
        mediaAttach: "Media files",
        mediaAttachDesc: "Automatic attachment to comments",
        mediaAttachToggle: "Enable media attachment to comments", 
        mediaAttachHint: "💡 Automatic attachment via drag&drop",
        mediaUsageSettings: "Media usage settings",
        mediaUsageDesc: "Control how media files are used",
        deleteMediaAfterUse: "Delete after use",
        useAllMediaFiles: "Use cyclically", 
        randomMediaOrder: "Random order",

        mediaManagement: "📎📱 Media Management",
        commentTemplatesTitle: "Backup Comments",
        scrollProtection: "🔄 Scroll protection",
        scrollProtectionDesc: "Stop process if too many consecutive posts are filtered",
        
        // AI Settings
        useAI: "Use AI for comment generation",
        useAIDesc: "Automatic comment generation using artificial intelligence",
        aiProvider: "AI Provider",
        aiProviderDesc: "Select service for comment generation",
        openaiApiKey: "OpenAI API Key",
        openaiApiKeyDesc: "API key from OpenAI (starts with sk-proj-...)",
        openrouterApiKey: "OpenRouter API Key", 
        openrouterApiKeyDesc: "API key from OpenRouter (starts with sk-or-v1-...)",
        aiModel: "Model",
        aiModelDesc: "Select model for generation",
        aiPrompt: "Generation prompt",
        aiPromptDesc: "Instruction for AI comment generation. Use {POST_TEXT} to insert post text",
        commentTemplates: "Comment templates (backup)",
        commentTemplatesDesc: "Used if AI is unavailable. Each comment on a new line",
        
        // Buttons
        save: "💾 Save",
        export: "Export",
        import: "Import", 
        reset: "Reset",
        test: "Test",
        saveSettings: "💾 Save Settings",
        testSettings: "🧪 Test Settings",
        close: "❌ Close",
        
        // More basic settings
        respectLimits: "Respect limits",
        respectLimitsDesc: "Automatic pause when limits are reached",
        avoidDuplicatePosts: "Avoid duplicate posts",
        avoidDuplicatePostsDesc: "Don't comment on posts repeatedly (uses ignore list)",
        avoidDuplicateUsers: "Avoid duplicate users", 
        avoidDuplicateUsersDesc: "Don't comment on posts from users already commented on",
        scrollProtection: "🔄 Scroll protection",
        scrollProtectionDesc: "Stop process if too many consecutive posts are filtered",
        
        // AI Settings expanded
        useAI: "Use AI for comment generation",
        useAIDesc: "Automatic comment generation using artificial intelligence",
        openaiModel: "OpenAI Model",
        openaiModelDesc: "Select model for generation",
        openrouterModel: "OpenRouter Model", 
        openrouterModelDesc: "Select model or specify custom one",
        groqApiKey: "Groq API Key",
        groqApiKeyDesc: "API key from Groq (starts with gsk_...)",
        groqModel: "Groq Model",
        groqModelDesc: "Select model for fast inference",
        groqCustomModel: "Custom Groq Model",
        groqCustomModelDesc: "Enter exact Groq model name<br>Example: llama-3.2-3b-preview, llama-guard-3-8b",
        geminiApiKey: "Google Gemini API Key",
        geminiApiKeyDesc: "API key from Google AI Studio",
        geminiModel: "Gemini Model",
        geminiModelDesc: "Select Google Gemini model",
        geminiCustomModel: "Custom Gemini Model",
        geminiCustomModelDesc: "Enter exact Gemini model name<br>Example: gemini-2.5-flash-8b, gemini-exp-1206",
        aiPromptPlaceholder: "AI prompt...",
        commentTemplatesPlaceholder: "Enter comments, each on a new line...",
        
        // Prompt Testing
        testPrompt: "🧪 Test Prompt",
        testPostPlaceholder: "Enter sample post text...",
        testResult: "Test Result:",
        promptTesting: "Testing prompt...",
        promptTestSuccess: "✅ Prompt test completed!",
        promptTestError: "❌ Prompt test failed:",
        resultCopied: "📋 Result copied to clipboard!",
        
        // First comment mode
        firstCommentMode: "⚡ \"First Comment\" Mode",
        firstCommentModeDesc: "Try to leave the first short comment on found posts. Works with AI and considers ignore list of duplicates.",
        firstCommentModeStatus: "🚧 Feature temporarily disabled for improvements",
        firstCommentPrompt: "Prompt for \"first comment\"",
        firstCommentPromptDesc: "Specialized instruction for AI. Use {POST_TEXT} for post text.",
        firstCommentPriority: "\"First comment\" priority",
        firstCommentPriorityDesc: "In first comment mode, commenting action is always added to selected actions",
        firstCommentMaxLength: "Maximum comment length",
        firstCommentMaxLengthDesc: "Character limit for first comments",
        firstCommentNote: "Duplicates are not published: posts with already left comments go to ignore list and are skipped.",
        
        // Post filtering
        postFilteringActivity: "Activity filtering",
        postFilteringActivityDesc: "Setting ranges of likes and comments for post processing",
        postFilteringTime: "📅 Time-based filtering",
        postFilteringTimeDesc: "Process only posts within specified time range (hours ago)",
        enableTimeFilter: "Enable time filter",
        enableTimeFilterDesc: "Filter posts by their publication time",
        timeFilterFrom: "From (hours ago)",
        timeFilterFromDesc: "Minimum post age in hours",
        timeFilterTo: "To (hours ago)",
        timeFilterToDesc: "Maximum post age in hours",
        timeFilterNote1: "0 = now",
        timeFilterNote2: "24 = day ago",
        timeExamples: "💡 Time setting examples:",
        timeExample1: "Fresh posts only: from 0 to 1 hour ago",
        timeExample2: "Today's posts: from 0 to 24 hours ago", 
        timeExample3: "Week's posts: from 0 to 168 hours ago",
        timeExample4: "Skip very new: from 2 to 12 hours ago",
        contentTypeFiltering: "📄 Content type filtering",
        photoOnly: "📷 Photo only",
        photoOnlyDesc: "Process posts containing only images",
        videoOnly: "🎥 Video only", 
        videoOnlyDesc: "Process posts containing only videos",
        textMedia: "📝 Text + media",
        textMediaDesc: "Process posts with text and photo/video",
        textOnly: "📄 Text only",
        textOnlyDesc: "Process posts containing only text",
        activityExamples: "💡 Activity setting examples:",
        activityExample1: "Popular posts: likes 100-5000, comments 20-500",
        activityExample2: "Support newcomers: likes 0-50, comments 0-10",
        activityExample3: "Medium activity: likes 10-200, comments 2-50",
        
        // User filtering
        enableUserFilter: "Enable user filter",
        enableUserFilterDesc: "Process only posts from users with certain characteristics",
        verificationStatus: "✅ Verification status",
        onlyVerified: "Only verified",
        onlyVerifiedDesc: "Process only users with blue checkmark",
        excludeVerified: "Exclude verified",
        excludeVerifiedDesc: "Process only regular users",
        avatarStatus: "🖼️ Avatar presence",
        onlyWithAvatar: "Only with avatar",
        onlyWithAvatarDesc: "Process only users with uploaded avatar",
        excludeWithAvatar: "Exclude with avatar",
        excludeWithAvatarDesc: "Process only users without avatar",
        userFilterExamples: "💡 User filtering examples:",
        userExample1: "Only verified: for working with verified accounts",
        userExample2: "Only with avatar: more active and styled profiles",
        userExample3: "Exclude verified: work only with regular users",
        userExample4: "⚠️ Follower filter: may not work due to Threads API limitations",
        
        // Language filtering
        enableLanguageFilter: "Enable language filter",
        enableLanguageFilterDesc: "Process only posts in selected languages",
        allowedLanguages: "🗣️ Allowed languages",
        excludedLanguages: "🚫 Excluded languages",
        excludedLanguagesDesc: "Posts in these languages will be skipped",
        languageRussian: "🇷🇺 Russian",
        languageRussianDesc: "Process posts in Russian",
        languageUkrainian: "🇺🇦 Ukrainian", 
        languageUkrainianDesc: "Process posts in Ukrainian",
        languageEnglish: "🇺🇸 English",
        languageEnglishDesc: "Process posts in English",
        languageHieroglyphs: "🇨🇳 Hieroglyphs",
        languageHieroglyphsDesc: "Process posts in Chinese, Japanese and other hieroglyphic languages",
        excludeRussian: "🇷🇺 Exclude Russian",
        excludeRussianDesc: "Skip posts in Russian",
        excludeUkrainian: "🇺🇦 Exclude Ukrainian",
        excludeUkrainianDesc: "Skip posts in Ukrainian", 
        excludeEnglish: "🇺🇸 Exclude English",
        excludeEnglishDesc: "Skip posts in English",
        excludeHieroglyphs: "🈲 Exclude hieroglyphs",
        excludeHieroglyphsDesc: "Skip posts in Chinese, Japanese, Korean",
        languageExamples: "💡 Language filter examples:",
        languageExample1: "Russian only: enable \"Russian\" in allowed languages",
        languageExample2: "Exclude hieroglyphs: enable \"Exclude hieroglyphs\" in excluded languages",
        languageExample3: "Russian + English: enable both languages in allowed",
        languageExample4: "All except Chinese: enable \"Exclude hieroglyphs\"",
        
        // Keyword search
        enableKeywordSearch: "Automatic search",
        enableKeywordSearchDesc: "Enable search and processing of posts by keywords",
        keywords: "Keywords",
        keywordsDesc: "Enter keywords for search (each on a new line)",
        searchSection: "Search section",
        searchSectionDesc: "Select which section to search posts in",
        searchSectionTop: "🔥 Top",
        searchSectionRecent: "⏰ Recent",
        maxPostsPerKeyword: "Maximum posts per search",
        maxPostsPerKeywordDesc: "How many posts to process for each keyword",
        keywordDelay: "Delay between keywords",
        keywordDelayDesc: "Pause between searching different keywords (seconds)",
        searchStrategy: "🎯 Search strategy",
        randomizeKeywords: "Random keyword order",
        randomizeKeywordsDesc: "Shuffle search order for naturalness",
        cyclicSearch: "Cyclic search",
        cyclicSearchDesc: "Repeat search for all keywords",
        keywordExamples: "💡 Keyword examples:",
        // Examples section headers
        timeExamples: "💡 Time setting examples:",
        userFilterExamples: "💡 User filtering setting examples:",
        languageExamples: "💡 Language filter usage examples:",
        
        keywordCategory1: "Technology: programming, artificial intelligence, web development, python, javascript, react",
        keywordCategory2: "Business: startup, marketing, entrepreneurship, sales, SMM",
        keywordCategory3: "Education: learning, courses, online education, university",
        
        // Notifications
        settingsSaveError: "Error saving settings",
        
        // Export/Import
        exportSettings: "Export settings",
        exportSettingsDesc: "Save all settings to file",
        importSettings: "Import settings", 
        importSettingsDesc: "Load settings from file",
        resetSettings: "Reset settings",
        resetSettingsDesc: "Restore default settings",
        
        // Scroll protection help text
        scrollProtectionHelp: "5–100 posts (default: 20)",
        
        // AI Provider options
        openaiOption: "OpenAI",
        openrouterOption: "OpenRouter (hundreds of models)",
        anthropicOption: "Anthropic (soon)",
        googleOption: "Google AI (soon)",
        
        // AI Provider and Models  
        openaiModels: {
            "gpt-4o-mini": "GPT-4o Mini (fast, cheap)",
            "gpt-4o": "GPT-4o (high quality)",
            "gpt-3.5-turbo": "GPT-3.5 Turbo (basic)"
        },
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
        
        // Status messages
        temporarilyDisabled: "🚧 Feature temporarily disabled for improvements",
        
        // Header buttons and text
        supportPatreon: "🚧 Support on Patreon",
        telegramChannel: "🔔 Telegram Channel",
        byAuthor: "by Evheniia",
        extendedSettingsTitle: "Extended automation settings",
        templateCount: "templates",
        
        // User Filtering section details
        filterCriteria: "🔍 Filter criteria",
        verificationStatus: "✅ Verification status", 
        avatarStatus: "🖼️ Avatar presence",
        onlyVerified: "Only verified",
        onlyVerifiedDesc: "Process only users with blue checkmark",
        onlyWithAvatar: "Only with avatar", 
        onlyWithAvatarDesc: "Process only users with uploaded avatar",
        excludeVerified: "Exclude verified",
        excludeVerifiedDesc: "Skip verified users",
        excludeWithAvatar: "Exclude with avatar",
        excludeWithAvatarDesc: "Skip users with avatars",
        
        // Language Filtering section details
        allowedLanguages: "📥 Allowed languages",
        excludedLanguages: "📤 Excluded languages",
        excludedLanguagesDesc: "Posts in these languages will be skipped",
        languageRussian: "🇷🇺 Russian",
        languageRussianDesc: "Process posts in Russian",
        languageUkrainian: "🇺🇦 Ukrainian", 
        languageUkrainianDesc: "Process posts in Ukrainian",
        languageEnglish: "🇺🇸 English",
        languageEnglishDesc: "Process posts in English",
        languageHieroglyphs: "🀄 Hieroglyphs",
        languageHieroglyphsDesc: "Process posts with hieroglyphs",
        excludeRussian: "🇷🇺 Exclude Russian",
        excludeRussianDesc: "Skip posts in Russian",
        excludeUkrainian: "🇺🇦 Exclude Ukrainian",
        excludeUkrainianDesc: "Skip posts in Ukrainian", 
        excludeEnglish: "🇺🇸 Exclude English",
        excludeEnglishDesc: "Skip posts in English",
        excludeHieroglyphs: "🀄 Exclude hieroglyphs",
        excludeHieroglyphsDesc: "Skip posts with hieroglyphs",
        
        // Keyword Search section details
        searchSectionTop: "🔥 Top",
        searchSectionRecent: "⏰ Recent",
        maxPostsPerKeyword: "Maximum posts per search",
        maxPostsPerKeywordDesc: "How many posts to process for each keyword",
        keywordDelay: "Delay between keywords", 
        keywordDelayDesc: "Pause between searching different keywords (seconds)",
        keywordCount: "keywords",
        
        // AI Generation prompt section
        generationPrompt: "Generation prompt",
        generationPromptDesc: "Instruction for AI comment generation. Use {POST_TEXT} to insert post text",
        
        // Custom model section
        customModel: "Custom model",
        customModelDesc: "Enter exact model name in format provider/model:variant<br>Example: qwen/qwen3-coder:free, anthropic/claude-3-opus",
        
        // First Comment Mode
        enableFirstCommentMode: "Enable \"first comment\" mode",
        
        // Post filtering detailed
        minLikes: "Minimum likes",
        minLikesDesc: "Posts with fewer likes will be skipped",
        maxLikes: "Maximum likes", 
        maxLikesDesc: "Posts with more likes will be skipped",
        minComments: "Minimum comments",
        minCommentsDesc: "Posts with fewer comments will be skipped",
        maxComments: "Maximum comments",
        maxCommentsDesc: "Posts with more comments will be skipped",
        
        // User filtering detailed
        filterCriteria: "🔍 Filter criteria",
        onlyVerifiedDesc: "Process only users with blue checkmark",
        excludeVerifiedDesc: "Process only regular users",
        onlyWithAvatarDesc: "Process only users with uploaded avatar",
        excludeWithAvatarDesc: "Process only users without avatar",
        
        // Language filtering detailed  
        allowedLanguagesDesc: "Posts in these languages will be processed",
        languageRussianDesc: "Process posts in Russian",
        languageUkrainianDesc: "Process posts in Ukrainian",
        languageEnglishDesc: "Process posts in English", 
        languageHieroglyphsDesc: "Process posts in Chinese, Japanese and other hieroglyphic languages",
        excludeRussianDesc: "Skip posts in Russian",
        excludeUkrainianDesc: "Skip posts in Ukrainian",
        excludeEnglishDesc: "Skip posts in English",
        excludeHieroglyphsDesc: "Skip posts in Chinese, Japanese, Korean",
        
        // Keyword search detailed
        keywordCount: "keywords",
        searchSectionDesc: "Select which section to search posts in",
        searchSectionTop: "🔥 Top",
        searchSectionRecent: "⏰ Recent",
        maxPostsPerKeywordDesc: "How many posts to process for each keyword",
        keywordDelayDesc: "Pause between searching different keywords (seconds)",
        randomizeKeywordsDesc: "Shuffle search order for naturalness",
        cyclicSearchDesc: "Repeat search for all keywords",
        
        // Time filter detailed
        timeFilterFrom: "From (hours ago)",
        timeFilterFromDesc: "Minimum post age in hours",
        timeFilterTo: "To (hours ago)", 
        timeFilterToDesc: "Maximum post age in hours",
        timeFilterNote1: "0 = now",
        timeFilterNote2: "24 = day ago",
        
        // Example texts for activity settings
        activityExample1Text: "Popular posts: likes 100-5000, comments 20-500",
        activityExample2Text: "Support newcomers: likes 0-50, comments 0-10", 
        activityExample3Text: "Medium activity: likes 10-200, comments 2-50",
        
        // User filtering examples
        userExample1Text: "Only verified: for working with verified accounts",
        userExample2Text: "Only with avatar: more active and styled profiles",
        userExample3Text: "Exclude verified: work only with regular users",
        userExample4Text: "⚠️ Follower filter: may not work due to Threads API limitations",
        
        // Language examples
        languageExample1Text: "Russian only: enable \"Russian\" in allowed languages",
        languageExample2Text: "Exclude hieroglyphs: enable \"Exclude hieroglyphs\" in excluded languages",
        languageExample3Text: "Russian + English: enable both languages in allowed",
        languageExample4Text: "All except Chinese: enable \"Exclude hieroglyphs\"",
        
        // Time examples
        timeExample1Text: "Fresh posts only: from 0 to 1 hour ago",
        timeExample2Text: "Today's posts: from 0 to 24 hours ago",
        timeExample3Text: "Week's posts: from 0 to 168 hours ago", 
        timeExample4Text: "Skip very new: from 2 to 12 hours ago",
        
        // Units
        sec: "sec",
        posts: "posts", 
        likes: "likes",
        comments: "comments",
        hours: "hours",
        characters: "characters"
    },
    ru: {
        title: "ThreadsAI - Расширенные настройки автоматизации",
        subtitle: "Расширенные настройки автоматизации",
        
        // Main sections
        stats: "📊 Статистика",
        basicSettings: "⚙️ Основные настройки",
        aiSettings: "🤖 Настройки ИИ",
        postFiltering: "🔍 Фильтрация постов",
        userFiltering: "👤 Фильтрация пользователей",
        languageFiltering: "🌐 Фильтрация по языкам",
        keywordSearch: "🔎 Поиск по ключевым словам",
        exportImport: "💾 Экспорт/Импорт",
        
        // Statistics
        totalComments: "Всего комментариев",
        totalLikes: "Всего лайков",
        sessionsCount: "Сессий",
        avgPerHour: "В час (среднее)",
        
        // Basic settings
        maxPosts: "Максимум постов",
        maxPostsDesc: "Количество постов для обработки за сессию",
        delayBetweenActions: "Задержка между действиями",
        delayDesc: "Случайная задержка в секундах",
        autoLikes: "Автолайки",
        autoLikesDesc: "Автоматически лайкать посты",
        stealthMode: "Скрытный режим",
        stealthModeDesc: "Имитация набора текста и поведения человека",
        respectLimits: "Соблюдать лимиты",
        respectLimitsDesc: "Автоматическая пауза при достижении лимитов",
        actionsPerHour: "Действий в час",
        actionsPerHourDesc: "Максимум действий для безопасной работы",
        avoidDuplicatePosts: "Избегать дубликатов постов",
        avoidDuplicatePostsDesc: "Не комментировать посты повторно (использует игнор‑лист)",
        avoidDuplicateUsers: "Избегать дубликатов пользователей",
        avoidDuplicateUsersDesc: "Не комментировать посты пользователей, которых уже комментировали",
        mediaAttach: "Медиафайлы",
        mediaAttachDesc: "Автоматическое прикрепление к комментариям",
        mediaAttachToggle: "Включить прикрепление медиа к комментариям",
        mediaAttachHint: "💡 Автоматическое прикрепление через drag&drop",
        mediaUsageSettings: "Настройки использования медиа",
        mediaUsageDesc: "Управление тем, как используются медиафайлы",
        deleteMediaAfterUse: "Удалять после использования",
        useAllMediaFiles: "Циклично использовать",
        randomMediaOrder: "Случайный порядок",

        mediaManagement: "📎📱 Управление медиафайлами",
        commentTemplatesTitle: "Резервные комментарии",
        scrollProtection: "🔄 Защита от зависания",
        scrollProtectionDesc: "Остановить процесс, если подряд отфильтровано слишком много постов",
        
        // AI Settings
        useAI: "Использовать ИИ для генерации комментариев",
        useAIDesc: "Автоматическая генерация комментариев с помощью искусственного интеллекта",
        aiProvider: "Провайдер ИИ",
        aiProviderDesc: "Выберите сервис для генерации комментариев",
        openaiApiKey: "OpenAI API Key",
        openaiApiKeyDesc: "Ключ API от OpenAI (начинается с sk-proj-...)",
        openrouterApiKey: "OpenRouter API Key",
        openrouterApiKeyDesc: "Ключ API от OpenRouter (начинается с sk-or-v1-...)",
        aiModel: "Модель",
        aiModelDesc: "Выберите модель для генерации",
        aiPrompt: "Промт для генерации",
        aiPromptDesc: "Инструкция для ИИ по генерации комментариев. Используйте {POST_TEXT} для вставки текста поста",
        commentTemplates: "Шаблоны комментариев (резерв)",
        commentTemplatesDesc: "Используются если ИИ недоступен. Каждый комментарий с новой строки",
        
        // Buttons
        save: "💾 Сохранить",
        export: "Экспорт",
        import: "Импорт",
        reset: "Сброс",
        test: "Тест",
        saveSettings: "💾 Сохранить настройки",
        testSettings: "🧪 Тест настроек",
        close: "❌ Закрыть",
        
        // More basic settings expanded
        respectLimits: "Соблюдать лимиты",
        respectLimitsDesc: "Автоматическая пауза при достижении лимитов",
        avoidDuplicatePosts: "Избегать дубликатов постов",
        avoidDuplicatePostsDesc: "Не комментировать посты повторно (использует игнор‑лист)",
        avoidDuplicateUsers: "Избегать дубликатов пользователей",
        avoidDuplicateUsersDesc: "Не комментировать посты пользователей, которых уже комментировали",
        scrollProtection: "🔄 Защита от зависания",
        scrollProtectionDesc: "Остановить процесс, если подряд отфильтровано слишком много постов",
        
        // AI Settings expanded
        useAI: "Использовать ИИ для генерации комментариев",
        useAIDesc: "Автоматическая генерация комментариев с помощью искусственного интеллекта",
        openaiModel: "Модель OpenAI",
        openaiModelDesc: "Выберите модель для генерации",
        openrouterModel: "Модель OpenRouter",
        openrouterModelDesc: "Выберите модель или укажите кастомную",
        groqApiKey: "Groq API Key",
        groqApiKeyDesc: "Ключ API от Groq (начинается с gsk_...)",
        groqModel: "Модель Groq",
        groqModelDesc: "Выберите модель для быстрого инференса",
        groqCustomModel: "Своя модель Groq",
        groqCustomModelDesc: "Введите точное название модели Groq<br>Пример: llama-3.2-3b-preview, llama-guard-3-8b",
        geminiApiKey: "Google Gemini API Key",
        geminiApiKeyDesc: "Ключ API от Google AI Studio",
        geminiModel: "Модель Gemini",
        geminiModelDesc: "Выберите модель Google Gemini",
        geminiCustomModel: "Своя модель Gemini",
        geminiCustomModelDesc: "Введите точное название модели Gemini<br>Пример: gemini-2.5-flash-8b, gemini-exp-1206",
        aiPromptPlaceholder: "Промт для ИИ...",
        commentTemplatesPlaceholder: "Введите комментарии, каждый с новой строки...",
        
        // Prompt Testing
        testPrompt: "🧪 Тестировать промт",
        testPostPlaceholder: "Введите пример текста поста...",
        testResult: "Результат тестирования:",
        promptTesting: "Тестирую промт...",
        promptTestSuccess: "✅ Тест промта завершён!",
        promptTestError: "❌ Ошибка тестирования промта:",
        resultCopied: "📋 Результат скопирован в буфер обмена!",
        
        // First comment mode
        firstCommentMode: "⚡ Режим «Первый комментарий»",
        firstCommentModeDesc: "Пытаться оставлять первый короткий комментарий на найденных постах. Работает с ИИ и учитывает игнор‑лист дублей.",
        firstCommentModeStatus: "🚧 Функция временно отключена для доработки",
        firstCommentPrompt: "Промт для «первонаха»",
        firstCommentPromptDesc: "Специализированная инструкция для ИИ. Используйте {POST_TEXT} для текста поста.",
        firstCommentPriority: "Приоритет «первонаха»",
        firstCommentPriorityDesc: "В режиме первонаха действие комментирования всегда добавляется к выбранным действиям",
        firstCommentMaxLength: "Максимальная длина комментария",
        firstCommentMaxLengthDesc: "Ограничение символов для первых комментариев",
        firstCommentNote: "Дубликаты не публикуются: посты с уже оставленным комментарием попадают в игнор‑лист и пропускаются.",
        
        // Post filtering
        postFilteringActivity: "Фильтрация по активности",
        postFilteringActivityDesc: "Настройка диапазонов лайков и комментариев для обработки постов",
        postFilteringTime: "📅 Фильтрация по времени публикации",
        postFilteringTimeDesc: "Обрабатывать только посты в указанном диапазоне времени (в часах назад)",
        enableTimeFilter: "Включить фильтр по времени",
        enableTimeFilterDesc: "Фильтровать посты по времени их публикации",
        timeFilterFrom: "От (часов назад)",
        timeFilterFromDesc: "Минимальный возраст поста в часах",
        timeFilterTo: "До (часов назад)",
        timeFilterToDesc: "Максимальный возраст поста в часах",
        timeFilterNote1: "0 = сейчас",
        timeFilterNote2: "24 = сутки назад",
        timeExamples: "💡 Примеры настроек времени:",
        timeExample1: "Только свежие посты: от 0 до 1 часа назад",
        timeExample2: "Посты за сегодня: от 0 до 24 часов назад",
        timeExample3: "Посты за неделю: от 0 до 168 часов назад",
        timeExample4: "Пропустить очень новые: от 2 до 12 часов назад",
        contentTypeFiltering: "📄 Фильтрация по типу контента",
        photoOnly: "📷 Только фото",
        photoOnlyDesc: "Обрабатывать посты содержащие только изображения",
        videoOnly: "🎥 Только видео",
        videoOnlyDesc: "Обрабатывать посты содержащие только видео",
        textMedia: "📝 Текст + медиа",
        textMediaDesc: "Обрабатывать посты с текстом и фото/видео",
        textOnly: "📄 Только текст",
        textOnlyDesc: "Обрабатывать посты содержащие только текст",
        activityExamples: "💡 Примеры настроек активности:",
        activityExample1: "Популярные посты: лайки 100-5000, комментарии 20-500",
        activityExample2: "Поддержка новичков: лайки 0-50, комментарии 0-10",
        activityExample3: "Средняя активность: лайки 10-200, комментарии 2-50",
        
        // User filtering
        enableUserFilter: "Включить фильтр пользователей",
        enableUserFilterDesc: "Обрабатывать только посты пользователей с определенными характеристиками",
        verificationStatus: "✅ Статус верификации",
        onlyVerified: "Только верифицированные",
        onlyVerifiedDesc: "Обрабатывать только пользователей с синей галочкой",
        excludeVerified: "Исключить верифицированных",
        excludeVerifiedDesc: "Обрабатывать только обычных пользователей",
        avatarStatus: "🖼️ Наличие аватарки",
        onlyWithAvatar: "Только с аватаркой",
        onlyWithAvatarDesc: "Обрабатывать только пользователей с загруженной аватаркой",
        excludeWithAvatar: "Исключить с аватаркой",
        excludeWithAvatarDesc: "Обрабатывать только пользователей без аватарки",
        userFilterExamples: "💡 Примеры настроек фильтрации пользователей:",
        userExample1: "Только верифицированные: для работы с проверенными аккаунтами",
        userExample2: "Только с аватаркой: более активные и оформленные профили",
        userExample3: "Исключить верифицированных: работа только с обычными пользователями",
        userExample4: "⚠️ Фильтр подписчиков: может не работать из-за ограничений Threads API",
        
        // Language filtering
        enableLanguageFilter: "Включить фильтр языков",
        enableLanguageFilterDesc: "Обрабатывать только посты на выбранных языках",
        allowedLanguages: "🗣️ Разрешенные языки",
        excludedLanguages: "🚫 Исключаемые языки",
        excludedLanguagesDesc: "Посты на этих языках будут пропускаться",
        languageRussian: "🇷🇺 Русский",
        languageRussianDesc: "Обрабатывать посты на русском языке",
        languageUkrainian: "🇺🇦 Украинский",
        languageUkrainianDesc: "Обрабатывать посты на украинском языке",
        languageEnglish: "🇺🇸 Английский",
        languageEnglishDesc: "Обрабатывать посты на английском языке",
        languageHieroglyphs: "🇨🇳 Иероглифы",
        languageHieroglyphsDesc: "Обрабатывать посты на китайском, японском и других языках с иероглифами",
        excludeRussian: "🇷🇺 Исключить русский",
        excludeRussianDesc: "Пропускать посты на русском языке",
        excludeUkrainian: "🇺🇦 Исключить украинский",
        excludeUkrainianDesc: "Пропускать посты на украинском языке",
        excludeEnglish: "🇺🇸 Исключить английский",
        excludeEnglishDesc: "Пропускать посты на английском языке",
        excludeHieroglyphs: "🈲 Исключить иероглифы",
        excludeHieroglyphsDesc: "Пропускать посты на китайском, японском, корейском",
        languageExamples: "💡 Примеры использования фильтра языков:",
        languageExample1: "Только русский: включите \"Русский\" в разрешенных языках",
        languageExample2: "Исключить иероглифы: включите \"Исключить иероглифы\" в исключаемых языках",
        languageExample3: "Русский + Английский: включите оба языка в разрешенных",
        languageExample4: "Все кроме китайского: включите \"Исключить иероглифы\"",
        
        // Keyword search
        enableKeywordSearch: "Автоматический поиск",
        enableKeywordSearchDesc: "Включить поиск и обработку постов по ключевым словам",
        keywords: "Ключевые слова",
        keywordsDesc: "Введите ключевые слова для поиска (каждое с новой строки)",
        searchSection: "Раздел поиска",
        searchSectionDesc: "Выберите в каком разделе искать посты",
        searchSectionTop: "🔥 Топ",
        searchSectionRecent: "⏰ Недавние",
        maxPostsPerKeyword: "Максимум постов за поиск",
        maxPostsPerKeywordDesc: "Сколько постов обрабатывать для каждого ключевого слова",
        keywordDelay: "Задержка между ключевыми словами",
        keywordDelayDesc: "Пауза между поиском разных ключевых слов (секунды)",
        searchStrategy: "🎯 Стратегия поиска",
        randomizeKeywords: "Случайный порядок ключевых слов",
        randomizeKeywordsDesc: "Перемешивать порядок поиска для натуральности",
        cyclicSearch: "Циклический поиск",
        cyclicSearchDesc: "Повторять поиск по всем ключевым словам",
        keywordExamples: "💡 Примеры ключевых слов:",
        // Examples section headers
        timeExamples: "💡 Примеры настроек времени:",
        userFilterExamples: "💡 Примеры настроек фильтрации пользователей:",
        languageExamples: "💡 Примеры использования фильтра языков:",
        
        keywordCategory1: "Технологии: программирование, искусственный интеллект, веб разработка, python, javascript, react",
        keywordCategory2: "Бизнес: стартап, маркетинг, предпринимательство, продажи, SMM",
        keywordCategory3: "Образование: обучение, курсы, онлайн образование, университет",
        
        // Notifications
        settingsSaveError: "Ошибка сохранения настроек",
        
        // Export/Import
        exportSettings: "Экспорт настроек",
        exportSettingsDesc: "Сохранить все настройки в файл",
        importSettings: "Импорт настроек",
        importSettingsDesc: "Загрузить настройки из файла",
        resetSettings: "Сброс настроек",
        resetSettingsDesc: "Восстановить настройки по умолчанию",
        
        // Scroll protection help text
        scrollProtectionHelp: "5–100 постов (по умолчанию: 20)",
        
        // AI Provider options
        openaiOption: "OpenAI",
        openrouterOption: "OpenRouter (сотни моделей)",
        anthropicOption: "Anthropic (скоро)",
        googleOption: "Google AI (скоро)",
        
        // AI Provider and Models
        openaiModels: {
            "gpt-4o-mini": "GPT-4o Mini (быстро, дешево)",
            "gpt-4o": "GPT-4o (качественно)",
            "gpt-3.5-turbo": "GPT-3.5 Turbo (базовая)"
        },
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
        
        // Status messages
        temporarilyDisabled: "🚧 Функция временно отключена для доработки",
        
        // Header buttons and text
        supportPatreon: "🚧 Поддержать на Patreon",
        telegramChannel: "🔔 Канал в Telegram",
        byAuthor: "by Evheniia",
        extendedSettingsTitle: "Расширенные настройки автоматизации",
        templateCount: "шаблонов",
        
        // User Filtering section details
        filterCriteria: "🔍 Критерии фильтрации",
        verificationStatus: "✅ Статус верификации", 
        avatarStatus: "🖼️ Наличие аватара",
        onlyVerified: "Только верифицированные",
        onlyVerifiedDesc: "Обрабатывать только пользователей с синей галочкой",
        onlyWithAvatar: "Только с аватаром", 
        onlyWithAvatarDesc: "Обрабатывать только пользователей с загруженным аватаром",
        excludeVerified: "Исключить верифицированных",
        excludeVerifiedDesc: "Пропускать верифицированных пользователей",
        excludeWithAvatar: "Исключить с аватаром",
        excludeWithAvatarDesc: "Пропускать пользователей с аватарами",
        
        // Language Filtering section details
        allowedLanguages: "📥 Разрешенные языки",
        excludedLanguages: "📤 Исключенные языки",
        excludedLanguagesDesc: "Посты на этих языках будут пропущены",
        languageRussian: "🇷🇺 Русский",
        languageRussianDesc: "Обрабатывать посты на русском языке",
        languageUkrainian: "🇺🇦 Украинский", 
        languageUkrainianDesc: "Обрабатывать посты на украинском языке",
        languageEnglish: "🇺🇸 Английский",
        languageEnglishDesc: "Обрабатывать посты на английском языке",
        languageHieroglyphs: "🀄 Иероглифы",
        languageHieroglyphsDesc: "Обрабатывать посты с иероглифами",
        excludeRussian: "🇷🇺 Исключить русский",
        excludeRussianDesc: "Пропускать посты на русском языке",
        excludeUkrainian: "🇺🇦 Исключить украинский",
        excludeUkrainianDesc: "Пропускать посты на украинском языке", 
        excludeEnglish: "🇺🇸 Исключить английский",
        excludeEnglishDesc: "Пропускать посты на английском языке",
        excludeHieroglyphs: "🀄 Исключить иероглифы",
        excludeHieroglyphsDesc: "Пропускать посты с иероглифами",
        
        // Keyword Search section details
        searchSectionTop: "🔥 Топ",
        searchSectionRecent: "⏰ Недавние",
        maxPostsPerKeyword: "Максимум постов на поиск",
        maxPostsPerKeywordDesc: "Сколько постов обрабатывать для каждого ключевого слова",
        keywordDelay: "Задержка между ключевыми словами", 
        keywordDelayDesc: "Пауза между поиском разных ключевых слов (секунды)",
        keywordCount: "ключевых слов",
        
        // AI Generation prompt section
        generationPrompt: "Промпт для генерации",
        generationPromptDesc: "Инструкция для генерации комментариев ИИ. Используйте {POST_TEXT} для вставки текста поста",
        
        // Custom model section
        customModel: "Кастомная модель",
        customModelDesc: "Введите точное название модели в формате провайдер/модель:вариант<br>Пример: qwen/qwen3-coder:free, anthropic/claude-3-opus",
        
        // First Comment Mode
        enableFirstCommentMode: "Включить режим «первонаха»",
        
        // Post filtering detailed
        minLikes: "Минимум лайков",
        minLikesDesc: "Посты с меньшим количеством лайков будут пропущены",
        maxLikes: "Максимум лайков",
        maxLikesDesc: "Посты с большим количеством лайков будут пропущены",
        minComments: "Минимум комментариев",
        minCommentsDesc: "Посты с меньшим количеством комментариев будут пропущены",
        maxComments: "Максимум комментариев",
        maxCommentsDesc: "Посты с большим количеством комментариев будут пропущены",
        
        // User filtering detailed
        filterCriteria: "🔍 Критерии фильтрации",
        onlyVerifiedDesc: "Обрабатывать только пользователей с синей галочкой",
        excludeVerifiedDesc: "Обрабатывать только обычных пользователей",
        onlyWithAvatarDesc: "Обрабатывать только пользователей с загруженной аватаркой",
        excludeWithAvatarDesc: "Обрабатывать только пользователей без аватарки",
        
        // Language filtering detailed
        allowedLanguagesDesc: "Посты на этих языках будут обрабатываться",
        languageRussianDesc: "Обрабатывать посты на русском языке",
        languageUkrainianDesc: "Обрабатывать посты на украинском языке", 
        languageEnglishDesc: "Обрабатывать посты на английском языке",
        languageHieroglyphsDesc: "Обрабатывать посты на китайском, японском и других языках с иероглифами",
        excludeRussianDesc: "Пропускать посты на русском языке",
        excludeUkrainianDesc: "Пропускать посты на украинском языке",
        excludeEnglishDesc: "Пропускать посты на английском языке",
        excludeHieroglyphsDesc: "Пропускать посты на китайском, японском, корейском",
        
        // Keyword search detailed
        keywordCount: "ключевых слов",
        searchSectionDesc: "Выберите в каком разделе искать посты",
        searchSectionTop: "🔥 Топ",
        searchSectionRecent: "⏰ Недавние",
        maxPostsPerKeywordDesc: "Сколько постов обрабатывать для каждого ключевого слова",
        keywordDelayDesc: "Пауза между поиском разных ключевых слов (секунды)",
        randomizeKeywordsDesc: "Перемешивать порядок поиска для натуральности",
        cyclicSearchDesc: "Повторять поиск по всем ключевым словам",
        
        // Time filter detailed
        timeFilterFrom: "От (часов назад)",
        timeFilterFromDesc: "Минимальный возраст поста в часах",
        timeFilterTo: "До (часов назад)",
        timeFilterToDesc: "Максимальный возраст поста в часах",
        timeFilterNote1: "0 = сейчас",
        timeFilterNote2: "24 = сутки назад",
        
        // Example texts for activity settings
        activityExample1Text: "Популярные посты: лайки 100-5000, комментарии 20-500",
        activityExample2Text: "Поддержка новичков: лайки 0-50, комментарии 0-10",
        activityExample3Text: "Средняя активность: лайки 10-200, комментарии 2-50",
        
        // User filtering examples  
        userExample1Text: "Только верифицированные: для работы с проверенными аккаунтами",
        userExample2Text: "Только с аватаркой: более активные и оформленные профили",
        userExample3Text: "Исключить верифицированных: работа только с обычными пользователями",
        userExample4Text: "⚠️ Фильтр подписчиков: может не работать из-за ограничений Threads API",
        
        // Language examples
        languageExample1Text: "Только русский: включите \"Русский\" в разрешенных языках",
        languageExample2Text: "Исключить иероглифы: включите \"Исключить иероглифы\" в исключаемых языках",
        languageExample3Text: "Русский + Английский: включите оба языка в разрешенных",
        languageExample4Text: "Все кроме китайского: включите \"Исключить иероглифы\"",
        
        // Time examples
        timeExample1Text: "Только свежие посты: от 0 до 1 часа назад",
        timeExample2Text: "Посты за сегодня: от 0 до 24 часов назад",
        timeExample3Text: "Посты за неделю: от 0 до 168 часов назад",
        timeExample4Text: "Пропустить очень новые: от 2 до 12 часов назад",
        
        // Units
        sec: "сек",
        posts: "постов", 
        likes: "лайков",
        comments: "комментариев",
        hours: "часов",
        characters: "символов"
    }
};

class ThreadsAISettings {
    constructor() {
        this.settings = {};
        this.comments = [];
        this.currentLanguage = 'ru'; // Default language
        this.init();
    }

    // Translation helper
    t(key) {
        if (!settingsTranslations || !this.currentLanguage) {
            return key;
        }
        const currentLangTranslations = settingsTranslations[this.currentLanguage];
        const fallbackTranslations = settingsTranslations['ru'];
        
        return (currentLangTranslations && currentLangTranslations[key]) || 
               (fallbackTranslations && fallbackTranslations[key]) || 
               key;
    }

    // Load language from storage
    async loadLanguage() {
        try {
            const result = await chrome.storage.sync.get(['language']);
            this.currentLanguage = result.language || 'ru';
            this.updateSettingsLanguage();
        } catch (error) {
            console.error('Error loading language:', error);
            this.currentLanguage = 'ru';
        }
    }

    // Update settings page language
    updateSettingsLanguage() {
        // Update page title
        document.title = this.t('title');
        
        // Update header title
        const headerTitle = document.querySelector('.header h1');
        if (headerTitle) {
            headerTitle.textContent = "🤖 ThreadsAI";
        }
        
        // Update subtitle
        const subtitle = document.getElementById('settingsSubtitle');
        if (subtitle) {
            subtitle.textContent = this.t('extendedSettingsTitle');
        }
        
        // Update main section headers
        this.updateElementByQuery('h2', this.t('stats'), '📊');
        this.updateElementByQuery('h2', this.t('basicSettings'), '⚙️');
        this.updateElementByQuery('h2', this.t('aiSettings'), '🤖');
        this.updateElementByQuery('h2', this.t('postFiltering'), '🔍');
        this.updateElementByQuery('h2', this.t('userFiltering'), '👤');
        this.updateElementByQuery('h2', this.t('languageFiltering'), '🌐');
        this.updateElementByQuery('h2', this.t('keywordSearch'), '🔎');
        this.updateElementByQuery('h2', this.t('exportImport'), '💾');
        
        // Update all elements with data-lang attributes
        this.updateAllDataLangElements();
        
        // Special handling for "sec" element that sometimes doesn't update
        const secElements = document.querySelectorAll('[data-lang="sec"]');
        secElements.forEach(element => {
            element.textContent = this.t('sec');
        });
        
        // Update AI Provider select options
        this.updateAIProviderOptions();
        
        // Update buttons
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) saveBtn.textContent = this.t('saveSettings');
        
        const testBtn = document.getElementById('testSettings');
        if (testBtn) testBtn.textContent = this.t('testSettings');
        
        const closeBtn = document.querySelector('button[onclick="window.close()"]');
        if (closeBtn) closeBtn.textContent = this.t('close');
        
        const exportBtn = document.getElementById('exportSettings');
        if (exportBtn) exportBtn.textContent = this.t('export');
        
        const importBtn = document.getElementById('importSettings');
        if (importBtn) importBtn.textContent = this.t('import');
        
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) resetBtn.textContent = this.t('reset');
    }
    
    // Helper method to update elements
    updateElementByQuery(tag, text, icon) {
        const elements = document.querySelectorAll(tag);
        elements.forEach(el => {
            if (el.textContent.includes(icon)) {
                el.textContent = text;
            }
        });
    }
    
    // Helper method to update elements by selector
    updateElementBySelector(selector, text) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = text;
        }
    }
    
    // Update all elements with data-lang attributes
    updateAllDataLangElements() {
        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(element => {
            const key = element.getAttribute('data-lang');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });
    }
    
    updateAIProviderOptions() {
        // Update AI Provider select options
        const aiProviderSelect = document.getElementById('aiProvider');
        if (aiProviderSelect) {
            const options = aiProviderSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                switch(value) {
                    case 'openai':
                        option.textContent = this.t('openaiOption');
                        break;
                    case 'openrouter':
                        option.textContent = this.t('openrouterOption');
                        break;
                    case 'anthropic':
                        option.textContent = this.t('anthropicOption');
                        break;
                    case 'google':
                        option.textContent = this.t('googleOption');
                        break;
                }
            });
        }
        
        // Update OpenAI model options
        const openaiModelSelect = document.getElementById('openaiModel');
        if (openaiModelSelect && settingsTranslations && settingsTranslations[this.currentLanguage] && settingsTranslations[this.currentLanguage].openaiModels) {
            const options = openaiModelSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                const modelTranslation = settingsTranslations[this.currentLanguage].openaiModels[value];
                if (modelTranslation) {
                    option.textContent = modelTranslation;
                }
            });
        }
        
        // Update OpenRouter model options
        const openrouterModelSelect = document.getElementById('openrouterModel');
        if (openrouterModelSelect && settingsTranslations && settingsTranslations[this.currentLanguage] && settingsTranslations[this.currentLanguage].openrouterModels) {
            const options = openrouterModelSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                const modelTranslation = settingsTranslations[this.currentLanguage].openrouterModels[value];
                if (modelTranslation) {
                    option.textContent = modelTranslation;
                }
            });
        }
        
        // Update Search Section options
        const searchSectionSelect = document.getElementById('searchSection');
        if (searchSectionSelect) {
            const options = searchSectionSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                switch(value) {
                    case 'top':
                        option.textContent = this.t('searchSectionTop');
                        break;
                    case 'recent':
                        option.textContent = this.t('searchSectionRecent');
                        break;
                }
            });
        }
    }

    async init() {
        // Load theme and language first
        await this.loadTheme();
        await this.loadLanguage();
        
        await this.loadSettings();
        this.bindEvents();
        this.updateUI();
        this.loadStats();
        
        // Setup theme listeners
        this.setupThemeListeners();
        
        // Load saved API key validation states
        await this.loadApiKeyValidationStates();
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

    async loadTheme() {
        try {
            const result = await chrome.storage.sync.get(['theme']);
            const savedTheme = result.theme || 'auto';
            
            let actualTheme = savedTheme;
            if (savedTheme === 'auto') {
                actualTheme = await this.detectSystemTheme();
            }
            
            document.body.setAttribute('data-theme', actualTheme);
            console.log(`✅ Loaded theme: ${savedTheme} (applied: ${actualTheme})`);
        } catch (error) {
            console.error('Error loading theme:', error);
            document.body.setAttribute('data-theme', 'light');
        }
    }

    setupThemeListeners() {
        // System theme change detection
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
                const result = await chrome.storage.sync.get(['theme']);
                const currentSetting = result.theme || 'auto';
                if (currentSetting === 'auto') {
                    const actualTheme = await this.detectSystemTheme();
                    document.body.setAttribute('data-theme', actualTheme);
                }
            });
        }
    }

    async loadSettings() {
        try {
            this.settings = await chrome.storage.sync.get({
                maxPosts: 50,
                minDelay: 30,
                maxDelay: 120,
                autoLike: true,
                stealthMode: true,
                respectLimits: true,
                avoidDuplicates: true,
                avoidDuplicateUsers: false,
                // First-Comment mode
                enableFirstCommentMode: false,
                firstCommentPrompt: `Напиши очень короткий, релевантный и дружелюбный "первый комментарий" к посту. Должен выглядеть как от первого комментатора.

Ограничения:
- Длина: 1-2 коротких предложения, максимум ~140 символов
- Без хештегов (если их нет в посте), без ссылок, без рекламы
- Соответствуй языку и тону поста (определи автоматически)
- Если пост содержит вопрос, дай краткий позитивный ответ или микро-инсайт
- Максимум 1 уместный эмодзи; избегай спамного/восторженного тона
- Избегай банальных клише ("Крутой пост!", "Класс!") если у поста есть контекст
- Если пост о коде/технологиях, отреагируй 1 микро-соображением; избегай туториального текста

Текст поста: {POST_TEXT}

Выведи только текст комментария:`,
                firstCommentPriority: true,
                firstCommentMaxLength: 140,
                actionsPerHour: 15,
                // AI Settings
                enableAI: false,
                aiProvider: 'openrouter',
                openaiApiKey: '',
                openaiModel: 'gpt-4o-mini',
                openrouterApiKey: '',
                openrouterModel: 'openai/gpt-4o-mini',
                groqApiKey: '',
                groqModel: 'llama-3.1-8b-instant',
                groqCustomModel: '',
                geminiApiKey: '',
                geminiModel: 'gemini-2.5-flash',
                geminiCustomModel: '',
                customModel: '',
                aiPrompt: `Ты должен написать короткий релевантный комментарий к посту в социальной сети на русском языке. Комментарий должен быть:
- Длиной 1-2 предложения  
- Естественным и дружелюбным
- Подходящим по теме поста
- Без излишней активности или спама

Текст поста: {POST_TEXT}

Напиши только комментарий, без лишних пояснений:`,
                // Post Filter Settings
                enablePostFilter: false,
                minLikes: 0,
                maxLikes: 1000,
                minComments: 0,
                maxComments: 100,
                        // Date Filter Settings
        enableDateFilter: false,
        dateFilterFrom: 0,
        dateFilterTo: 24,
        maxScrollAttempts: 20,
                // Content Type Filters
                filterPhotoOnly: false,
                filterVideoOnly: false,
                filterTextMedia: true,
                filterTextOnly: true,
                // Keyword Search Settings
                enableKeywordSearch: false,
                searchKeywords: ['программирование', 'искусственный интеллект', 'веб разработка'],
                searchSection: 'top',
                maxPostsPerKeyword: 10,
                keywordDelay: 30,
                randomizeKeywords: true,
                cyclicSearch: false,
                // Language Filter Settings
                enableLanguageFilter: false,
                allowedLanguages: ['russian', 'english'],
                excludedLanguages: [],
                // User Filter Settings
                enableUserFilter: false,
                onlyVerified: false,
                excludeVerified: false,
                onlyWithAvatar: false,
                excludeWithAvatar: false,
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
                // Media attachment settings
                enableAttachMedia: false,
                selectedMediaFiles: [],
                deleteMediaAfterUse: false,
                useAllMediaFiles: true,
                randomMediaOrder: false
            });

            this.comments = [...this.settings.comments];
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showNotification('Ошибка загрузки настроек', 'error');
        }
    }

    async checkAndFixDeprecatedModels() {
        const deprecatedGroqModels = ['mixtral-8x7b-32768', 'llama-3.1-70b-versatile'];
        if (deprecatedGroqModels.includes(this.settings.groqModel)) {
            const oldModel = this.settings.groqModel;
            this.settings.groqModel = 'llama-3.1-8b-instant';
            this.showNotification(`⚠️ Модель Groq "${oldModel}" была отключена провайдером. Автоматически выбрана "llama-3.1-8b-instant"`, 'warning');
            // Save the corrected setting
            await chrome.storage.sync.set({ groqModel: this.settings.groqModel });
        }
    }

    updateUI() {
        // Check for deprecated Groq models and fix them
        this.checkAndFixDeprecatedModels();
        
        // Update form fields
        document.getElementById('maxPosts').value = this.settings.maxPosts;
        document.getElementById('minDelay').value = this.settings.minDelay;
        document.getElementById('maxDelay').value = this.settings.maxDelay;
        document.getElementById('autoLike').checked = this.settings.autoLike;
        document.getElementById('stealthMode').checked = this.settings.stealthMode;
        document.getElementById('respectLimits').checked = this.settings.respectLimits;
        document.getElementById('avoidDuplicates').checked = this.settings.avoidDuplicates;
        document.getElementById('avoidDuplicateUsers').checked = this.settings.avoidDuplicateUsers;
        // First comment UI
        const enableFirst = document.getElementById('enableFirstCommentMode');
        const firstPrompt = document.getElementById('firstCommentPrompt');
        const firstPriority = document.getElementById('firstCommentPriority');
        const firstMaxLength = document.getElementById('firstCommentMaxLength');
        const firstMaxLengthValue = document.getElementById('firstCommentMaxLengthValue');
        
        if (enableFirst) {
            enableFirst.checked = false; // Принудительно отключено в разработке
            enableFirst.disabled = true;
        }
        if (firstPrompt) firstPrompt.value = this.settings.firstCommentPrompt;
        if (firstPriority) firstPriority.checked = this.settings.firstCommentPriority;
        if (firstMaxLength) {
            firstMaxLength.value = this.settings.firstCommentMaxLength;
            if (firstMaxLengthValue) firstMaxLengthValue.textContent = this.settings.firstCommentMaxLength;
        }
        // first-comment
        // (UI добавим позже при необходимости; настройка уже сохраняется)
        document.getElementById('actionsPerHour').value = this.settings.actionsPerHour;
        document.getElementById('actionsPerHourValue').textContent = this.settings.actionsPerHour;

        // Update AI settings
        document.getElementById('enableAI').checked = this.settings.enableAI;
        document.getElementById('aiProvider').value = this.settings.aiProvider;
        document.getElementById('openaiApiKey').value = this.settings.openaiApiKey;
        document.getElementById('openaiModel').value = this.settings.openaiModel;
        document.getElementById('openrouterApiKey').value = this.settings.openrouterApiKey;
        document.getElementById('openrouterModel').value = this.settings.openrouterModel;
        document.getElementById('groqApiKey').value = this.settings.groqApiKey;
        document.getElementById('groqModel').value = this.settings.groqModel;
        document.getElementById('groqCustomModel').value = this.settings.groqCustomModel;
        document.getElementById('geminiApiKey').value = this.settings.geminiApiKey;
        document.getElementById('geminiModel').value = this.settings.geminiModel;
        document.getElementById('geminiCustomModel').value = this.settings.geminiCustomModel;
        document.getElementById('customModel').value = this.settings.customModel;
        document.getElementById('aiPrompt').value = this.settings.aiPrompt;
        document.getElementById('commentsTemplate').value = this.settings.comments.join('\n');

        // Update Post Filter settings
        document.getElementById('enablePostFilter').checked = this.settings.enablePostFilter;
        document.getElementById('minLikes').value = this.settings.minLikes;
        document.getElementById('maxLikes').value = this.settings.maxLikes;
        document.getElementById('minComments').value = this.settings.minComments;
        document.getElementById('maxComments').value = this.settings.maxComments;
        
        // Update Date Filter settings
        document.getElementById('enableDateFilter').checked = this.settings.enableDateFilter;
        document.getElementById('dateFilterFrom').value = this.settings.dateFilterFrom;
        document.getElementById('dateFilterTo').value = this.settings.dateFilterTo;
        document.getElementById('maxScrollAttempts').value = this.settings.maxScrollAttempts;
        
        // Update Content Type Filter settings
        document.getElementById('filterPhotoOnly').checked = this.settings.filterPhotoOnly;
        document.getElementById('filterVideoOnly').checked = this.settings.filterVideoOnly;
        document.getElementById('filterTextMedia').checked = this.settings.filterTextMedia;
        document.getElementById('filterTextOnly').checked = this.settings.filterTextOnly;
        
        // Update Keyword Search settings
        document.getElementById('enableKeywordSearch').checked = this.settings.enableKeywordSearch;
        document.getElementById('searchKeywords').value = this.settings.searchKeywords.join('\n');
        document.getElementById('searchSection').value = this.settings.searchSection;
        document.getElementById('maxPostsPerKeyword').value = this.settings.maxPostsPerKeyword;
        document.getElementById('keywordDelay').value = this.settings.keywordDelay;
        document.getElementById('randomizeKeywords').checked = this.settings.randomizeKeywords;
        document.getElementById('cyclicSearch').checked = this.settings.cyclicSearch;
        
        // Update Language Filter settings
        document.getElementById('enableLanguageFilter').checked = this.settings.enableLanguageFilter;
        // Allowed languages (default to empty whitelist)
        document.getElementById('languageRussian').checked = (this.settings.allowedLanguages || []).includes('russian');
        document.getElementById('languageUkrainian').checked = (this.settings.allowedLanguages || []).includes('ukrainian');
        document.getElementById('languageEnglish').checked = (this.settings.allowedLanguages || []).includes('english');
        document.getElementById('languageHieroglyphs').checked = (this.settings.allowedLanguages || []).includes('hieroglyphs');
        // Excluded languages
        document.getElementById('excludeLanguageRussian').checked = this.settings.excludedLanguages.includes('russian');
        document.getElementById('excludeLanguageUkrainian').checked = this.settings.excludedLanguages.includes('ukrainian');
        document.getElementById('excludeLanguageEnglish').checked = this.settings.excludedLanguages.includes('english');
        document.getElementById('excludeLanguageHieroglyphs').checked = this.settings.excludedLanguages.includes('hieroglyphs');
        
        // Update User Filter settings
        document.getElementById('enableUserFilter').checked = this.settings.enableUserFilter;
        
        // Проверяем лимиты медиа файлов при загрузке
        if (this.settings.selectedMediaFiles && this.settings.selectedMediaFiles.length > 0) {
            const videoCount = this.settings.selectedMediaFiles.filter(file => file.type === 'video/mp4').length;
            const imageCount = this.settings.selectedMediaFiles.filter(file => file.type.startsWith('image/')).length;
            
            console.log(`📎 Loaded media files: ${this.settings.selectedMediaFiles.length} total (${imageCount} images, ${videoCount}/3 videos)`);
            
            // Предупреждение если превышен лимит видео
            if (videoCount > 3) {
                console.warn(`⚠️ Video limit exceeded: ${videoCount} videos loaded (max: 3)`);
                this.showNotification(`⚠️ Внимание: загружено ${videoCount} видео файлов (максимум: 3). Некоторые могут не работать корректно.`, 'warning');
            }
        }
        document.getElementById('onlyVerified').checked = this.settings.onlyVerified;
        document.getElementById('excludeVerified').checked = this.settings.excludeVerified;
        document.getElementById('onlyWithAvatar').checked = this.settings.onlyWithAvatar;
        document.getElementById('excludeWithAvatar').checked = this.settings.excludeWithAvatar;

        // Update Media Attachment settings
        const enableAttachMediaElement = document.getElementById('enableAttachMedia');
        if (enableAttachMediaElement) {
            enableAttachMediaElement.checked = this.settings.enableAttachMedia;
            this.updateSelectedFilesList();
        }

        // Update Media Usage settings
        document.getElementById('deleteMediaAfterUse').checked = this.settings.deleteMediaAfterUse;
        document.getElementById('useAllMediaFiles').checked = this.settings.useAllMediaFiles;
        document.getElementById('randomMediaOrder').checked = this.settings.randomMediaOrder;

        // Update AI UI states
        this.toggleAISettings(this.settings.enableAI);
        this.toggleProviderSettings(this.settings.aiProvider);
        this.toggleCustomModel(this.settings.openrouterModel);
        this.toggleGroqCustomModel(this.settings.groqModel);
        this.toggleGeminiCustomModel(this.settings.geminiModel);
        this.togglePostFilterSettings(this.settings.enablePostFilter);
        this.toggleDateFilterSettings(this.settings.enableDateFilter);
        this.toggleKeywordSearchSettings(this.settings.enableKeywordSearch);
        this.toggleLanguageFilterSettings(this.settings.enableLanguageFilter);
        this.toggleUserFilterSettings(this.settings.enableUserFilter);
        this.toggleFirstCommentSettings(this.settings.enableFirstCommentMode);
        this.toggleMediaSettings(this.settings.enableAttachMedia);
        this.updateCommentCount();
        this.updateKeywordCount();


    }



    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindEvents() {
        // Range input updates
        document.getElementById('actionsPerHour').addEventListener('input', (e) => {
            document.getElementById('actionsPerHourValue').textContent = e.target.value;
        });

        // AI settings events
        document.getElementById('enableAI').addEventListener('change', (e) => {
            this.toggleAISettings(e.target.checked);
        });

        // Media settings events
        document.getElementById('enableAttachMedia').addEventListener('change', (e) => {
            this.toggleMediaSettings(e.target.checked);
        });

        // API Key validation events
        this.setupApiKeyValidation();

        document.getElementById('aiProvider').addEventListener('change', (e) => {
            this.toggleProviderSettings(e.target.value);
            this.autoSave(); // Save settings when switching providers
        });

        document.getElementById('openrouterModel').addEventListener('change', (e) => {
            this.toggleCustomModel(e.target.value);
        });

        document.getElementById('groqModel').addEventListener('change', (e) => {
            this.toggleGroqCustomModel(e.target.value);
        });

        document.getElementById('geminiModel').addEventListener('change', (e) => {
            this.toggleGeminiCustomModel(e.target.value);
        });

        // Post Filter toggle handler
        document.getElementById('enablePostFilter').addEventListener('change', (e) => {
            this.togglePostFilterSettings(e.target.checked);
        });

        // Date Filter toggle handler
        document.getElementById('enableDateFilter').addEventListener('change', (e) => {
            this.toggleDateFilterSettings(e.target.checked);
        });

        // Keyword Search toggle handler
        document.getElementById('enableKeywordSearch').addEventListener('change', (e) => {
            this.toggleKeywordSearchSettings(e.target.checked);
        });

        // Language Filter toggle handler
        document.getElementById('enableLanguageFilter').addEventListener('change', (e) => {
            this.toggleLanguageFilterSettings(e.target.checked);
        });

        // User Filter toggle handler
        document.getElementById('enableUserFilter').addEventListener('change', (e) => {
            this.toggleUserFilterSettings(e.target.checked);
        });



        // Keyword count update handler
        document.getElementById('searchKeywords').addEventListener('input', () => {
            this.updateKeywordCount();
        });

        // First-comment toggle
        const enableFirst = document.getElementById('enableFirstCommentMode');
        if (enableFirst) {
            enableFirst.addEventListener('change', (e) => {
                this.toggleFirstCommentSettings(e.target.checked);
                this.autoSave();
            });
        }
        const firstPrompt = document.getElementById('firstCommentPrompt');
        if (firstPrompt) {
            firstPrompt.addEventListener('input', () => {
                this.autoSave();
            });
        }
        
        const firstPriority = document.getElementById('firstCommentPriority');
        if (firstPriority) {
            firstPriority.addEventListener('change', () => {
                this.autoSave();
            });
        }
        
        const firstMaxLength = document.getElementById('firstCommentMaxLength');
        const firstMaxLengthValue = document.getElementById('firstCommentMaxLengthValue');
        if (firstMaxLength) {
            firstMaxLength.addEventListener('input', (e) => {
                if (firstMaxLengthValue) firstMaxLengthValue.textContent = e.target.value;
                this.autoSave();
            });
        }

        document.getElementById('commentsTemplate').addEventListener('input', () => {
            this.updateCommentCount();
        });

        // Media attachment events
        const mediaFilesInput = document.getElementById('mediaFiles');
        if (mediaFilesInput) {
            mediaFilesInput.addEventListener('change', (e) => {
                this.handleFileSelection(e);
            });
        }

        const clearMediaFilesBtn = document.getElementById('clearMediaFiles');
        if (clearMediaFilesBtn) {
                    clearMediaFilesBtn.addEventListener('click', () => {
            this.clearMediaFiles();
        });
        
        // Добавляем обработчик для кнопки очистки видео
        const clearVideoFilesBtn = document.getElementById('clearVideoFiles');
        if (clearVideoFilesBtn) {
            clearVideoFilesBtn.addEventListener('click', () => {
                this.clearVideoFiles();
            });
        }
        
        // Добавляем обработчик для кнопки оптимизации хранилища
        const optimizeStorageBtn = document.getElementById('optimizeStorage');
        if (optimizeStorageBtn) {
            optimizeStorageBtn.addEventListener('click', () => {
                this.optimizeStorage();
            });
        }
        }

        // Prompt testing handlers
        const testPromptBtn = document.getElementById('testPromptBtn');
        if (testPromptBtn) {
            testPromptBtn.addEventListener('click', () => {
                this.testPrompt();
            });
        }

        const copyResultBtn = document.getElementById('copyResultBtn');
        if (copyResultBtn) {
            copyResultBtn.addEventListener('click', () => {
                this.copyTestResult();
            });
        }

        // Save settings
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Test settings
        document.getElementById('testSettings').addEventListener('click', () => {
            this.testSettings();
        });

        // Export settings
        document.getElementById('exportSettings').addEventListener('click', () => {
            this.exportSettings();
        });

        // Import settings
        document.getElementById('importSettings').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importSettings(e.target.files[0]);
        });

        // Reset settings
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Auto-save on input change
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.autoSave();
            });
        });
        
        // Проверяем лимиты при загрузке
        this.checkMediaLimits();
    }
    
    async checkMediaLimits() {
        const files = this.settings.selectedMediaFiles || [];
        const videoCount = files.filter(f => f.type === 'video/mp4').length;
        const imageCount = files.filter(f => f.type.startsWith('image/')).length;
        
        console.log(`📎 Media limits check: ${files.length}/50 total files (${imageCount} images, ${videoCount}/3 videos)`);
        
        // Проверяем использование хранилища
        try {
            const storageInfo = await chrome.storage.local.getBytesInUse();
            const storageQuota = chrome.storage.local.QUOTA_BYTES || (100 * 1024 * 1024);
            const usagePercent = (storageInfo / storageQuota) * 100;
            
            console.log(`📦 Storage usage: ${(storageInfo / 1024 / 1024).toFixed(1)}MB / ${(storageQuota / 1024 / 1024).toFixed(1)}MB (${usagePercent.toFixed(1)}%)`);
            
            if (usagePercent > 90) {
                this.showNotification(`⚠️ Внимание: хранилище почти заполнено (${usagePercent.toFixed(1)}%). Удалите старые файлы.`, 'warning');
            } else if (usagePercent > 70) {
                this.showNotification(`ℹ️ Информация: хранилище заполнено на ${usagePercent.toFixed(1)}%. Рекомендуется очистка.`, 'info');
            }
        } catch (error) {
            console.error('Error checking storage usage:', error);
        }
        
        if (videoCount > 3) {
            this.showNotification(`⚠️ Внимание: превышен лимит видео файлов (${videoCount}/3). Удалите лишние видео для корректной работы.`, 'warning');
        }
        
        if (files.length > 45) {
            this.showNotification(`ℹ️ Информация: приближается лимит файлов (${files.length}/50). Можно добавить еще ${50 - files.length} файл(ов).`, 'info');
        }
    }

    // Media file handling methods
    handleFileSelection(event) {
        const files = Array.from(event.target.files);
        const currentFiles = this.settings.selectedMediaFiles || [];
        const maxFiles = 50;
        const maxVideoFiles = 3;
        
        console.log(`📎 Selected ${files.length} files for processing`);
        
        // Показываем информацию о выбранных файлах
        const newVideoCount = files.filter(f => f.type === 'video/mp4').length;
        const newImageCount = files.filter(f => f.type.startsWith('image/')).length;
        
        this.showNotification(`📁 Выбрано ${files.length} файлов: ${newImageCount} изображений, ${newVideoCount} видео`, 'info');
        
        // Проверяем лимит файлов
        if (currentFiles.length + files.length > maxFiles) {
            const excessFiles = currentFiles.length + files.length - maxFiles;
            const filesToProcess = files.slice(0, maxFiles - currentFiles.length);
            
            if (filesToProcess.length === 0) {
                this.showNotification(`❌ Достигнут лимит файлов! У вас уже ${currentFiles.length}/50 файлов. Удалите старые файлы перед добавлением новых.`, 'error');
                return;
            }
            
            // Показываем детальное уведомление о том, что происходит
            const videoCount = filesToProcess.filter(f => f.type === 'video/mp4').length;
            const imageCount = filesToProcess.filter(f => f.type.startsWith('image/'));
            const skippedCount = files.length - filesToProcess.length;
            
            let message = `⚠️ Достигнут лимит файлов! `;
            message += `Добавляем первые ${filesToProcess.length} файлов (${imageCount.length} изображений, ${videoCount} видео). `;
            message += `Пропущено: ${skippedCount} файлов. `;
            message += `Рекомендуется: удалить старые файлы или добавить файлы меньшими группами.`;
            
            this.showNotification(message, 'warning');
            
            // Показываем дополнительную информацию в консоли
            console.log(`📊 File limit reached: ${currentFiles.length} current + ${files.length} new = ${currentFiles.length + files.length} total (max: ${maxFiles})`);
            console.log(`📊 Processing: ${filesToProcess.length} files, Skipped: ${skippedCount} files`);
            
            return this.handleFileSelection({ target: { files: filesToProcess } });
        }
        
        // Проверяем лимит видео файлов
        const currentVideoFiles = currentFiles.filter(file => file.type === 'video/mp4').length;
        const newVideoFiles = files.filter(file => file.type === 'video/mp4').length;
        
        console.log(`📎 Current files: ${currentFiles.length} total (${currentFiles.filter(f => f.type.startsWith('image/')).length} images, ${currentVideoFiles}/3 videos)`);
        console.log(`📎 New files: ${files.length} total (${files.filter(f => f.type.startsWith('image/')).length} images, ${newVideoFiles} videos)`);
        
        if (currentVideoFiles + newVideoFiles > maxVideoFiles) {
            const excessVideos = currentVideoFiles + newVideoFiles - maxVideoFiles;
            
            // Детальное уведомление о превышении лимита видео
            let message = `⚠️ Превышен лимит видео файлов! `;
            message += `Сейчас: ${currentVideoFiles}/3, пытаетесь добавить: ${newVideoFiles}. `;
            message += `Лишние: ${excessVideos} видео файл(ов) не будут добавлены. `;
            message += `Рекомендуется: удалить старые видео или добавить видео отдельно от изображений.`;
            
            this.showNotification(message, 'warning');
            
            // Убираем видео файлы из списка для обработки
            const filesWithoutVideo = files.filter(file => file.type !== 'video/mp4');
            if (filesWithoutVideo.length === 0) {
                this.showNotification('❌ Все выбранные файлы - видео. Добавьте изображения или уменьшите количество видео файлов.', 'error');
                return;
            }
            
            // Показываем, сколько файлов будет обработано
            const remainingImages = filesWithoutVideo.filter(f => f.type.startsWith('image/')).length;
            const remainingVideos = filesWithoutVideo.filter(f => f.type === 'video/mp4').length;
            
            let processMessage = `📷 Обрабатываем ${remainingImages} изображений`;
            if (remainingVideos > 0) {
                processMessage += ` и ${remainingVideos} видео файлов`;
            }
            processMessage += ` (лишние видео пропущены из-за лимита)`;
            
            this.showNotification(processMessage, 'info');
            
            console.log(`📊 Video limit exceeded: ${currentVideoFiles} current + ${newVideoFiles} new = ${currentVideoFiles + newVideoFiles} total (max: ${maxVideoFiles})`);
            console.log(`📊 Processing: ${filesWithoutVideo.length} files (${remainingImages} images, ${remainingVideos} videos), Skipped: ${excessVideos} videos`);
            
            return this.handleFileSelection({ target: { files: filesWithoutVideo } });
        }
        
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
            
            if (!validTypes.includes(file.type)) {
                this.showNotification(`Файл ${file.name} имеет неподдерживаемый тип. Разрешены: JPEG, PNG, MP4`, 'error');
                return false;
            }
            
            // Ограничение на размер файла
            const maxFileSize = 20 * 1024 * 1024; // 20MB максимум
            if (file.size > maxFileSize) {
                this.showNotification(`Файл ${file.name} слишком большой: ${(file.size / 1024 / 1024).toFixed(1)}MB. Максимум: 20MB`, 'error');
                return false;
            }
            
            // Предупреждение для больших файлов
            if (file.size > 5 * 1024 * 1024) { // 5MB предупреждение
                this.showNotification(`Файл ${file.name} большой: ${(file.size / 1024 / 1024).toFixed(1)}MB. Сохранение может занять время`, 'warning');
            }
            
            return true;
        });

        // Показываем результат фильтрации
        const invalidCount = files.length - validFiles.length;
        if (invalidCount > 0) {
            this.showNotification(`⚠️ Отфильтровано ${invalidCount} неподходящих файлов. Обрабатываем ${validFiles.length} валидных файлов.`, 'warning');
        }

        if (validFiles.length === 0) {
            this.showNotification('Не выбрано ни одного подходящего файла', 'error');
            return;
        }

        const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
        const videoCount = validFiles.filter(file => file.type === 'video/mp4').length;
        const imageCount = validFiles.filter(file => file.type.startsWith('image/')).length;
        
        // Проверяем общий размер файлов
        const maxTotalSize = 50 * 1024 * 1024; // 50MB максимум для одного добавления
        if (totalSize > maxTotalSize) {
            const excessSize = totalSize - maxTotalSize;
            this.showNotification(`❌ Общий размер файлов слишком большой: ${(totalSize / 1024 / 1024).toFixed(1)}MB. Максимум: 50MB. Превышение: ${(excessSize / 1024 / 1024).toFixed(1)}MB. Рекомендуется: разделите файлы на меньшие группы.`, 'error');
            return;
        }
        
        console.log(`📎 Processing ${validFiles.length} valid files (total size: ${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
        console.log(`📎 Breakdown: ${imageCount} images, ${videoCount} videos`);
        
        // Проверяем, не превысит ли добавление общий лимит файлов
        const totalFilesAfter = currentFiles.length + validFiles.length;
        if (totalFilesAfter > 50) {
            const excessFiles = totalFilesAfter - 50;
            this.showNotification(`⚠️ Внимание: после добавления будет ${totalFilesAfter}/50 файлов (превышение на ${excessFiles}). Рекомендуется: удалить старые файлы или добавить файлы меньшими группами.`, 'warning');
        }
        
        // Показываем информацию о лимитах
        if (videoCount > 0) {
            const totalVideosAfter = currentFiles.filter(f => f.type === 'video/mp4').length + videoCount;
            if (totalVideosAfter > 3) {
                const excessVideos = totalVideosAfter - 3;
                this.showNotification(`⚠️ Внимание: после добавления будет ${totalVideosAfter}/3 видео файлов (превышение на ${excessVideos}). Рекомендуется: удалить старые видео или добавить видео отдельно.`, 'warning');
            } else {
                this.showNotification(`📹 Добавляем ${videoCount} видео файл(ов). Всего видео: ${totalVideosAfter}/3`, 'info');
            }
        }
        
        // Convert files to base64 for storage
        this.convertFilesToBase64(validFiles);
    }

    async convertFilesToBase64(files) {
        // Показываем прогресс для больших файлов
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const videoCount = files.filter(file => file.type === 'video/mp4').length;
        
        if (totalSize > 10 * 1024 * 1024) { // 10MB общий размер
            this.showNotification(`Обработка ${files.length} файлов (${(totalSize / 1024 / 1024).toFixed(1)}MB). Это может занять некоторое время...`, 'info');
        }
        
        // Информация о видео файлах
        if (videoCount > 0) {
            console.log(`📹 Processing ${videoCount} video file(s) out of ${files.length} total files`);
            
            // Проверяем лимит видео
            if (videoCount > 3) {
                console.warn(`⚠️ Warning: ${videoCount} video files selected (max: 3). This may cause issues.`);
                this.showNotification(`⚠️ Внимание: выбрано ${videoCount} видео файлов (максимум: 3). Это может вызвать проблемы.`, 'warning');
            }
        }
        
        const filePromises = files.map((file, index) => {
            return new Promise((resolve, reject) => {
                // Предупреждение для больших файлов, но не блокируем их
                const warningSize = 5 * 1024 * 1024; // 5MB предупреждение
                if (file.size > warningSize) {
                    console.log(`📎 Processing large file ${index + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
                }
                
                const reader = new FileReader();
                reader.onload = () => {
                    console.log(`✅ Converted file ${index + 1}/${files.length}: ${file.name}`);
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: reader.result
                    });
                };
                reader.onerror = (error) => {
                    console.error(`❌ Error reading file ${file.name}:`, error);
                    reject(new Error(`Failed to read file: ${file.name}`));
                };
                reader.readAsDataURL(file);
            });
        });

        try {
            const convertedFiles = await Promise.all(filePromises);
            
            // Добавляем ID к новым файлам
            const filesWithIds = convertedFiles.map(file => ({
                ...file,
                id: this.generateFileId(file)
            }));
            
            // Сохраняем файлы отдельно в chrome.storage.local (больший лимит)
            await this.saveMediaFilesLocally(filesWithIds);
            
            // В основных настройках сохраняем только метаданные
            const existingFiles = this.settings.selectedMediaFiles || [];
            const newMetadata = filesWithIds.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                id: file.id
            }));
            
            this.settings.selectedMediaFiles = [...existingFiles, ...newMetadata];
            
            this.updateSelectedFilesList();
            this.autoSave();
            this.showNotification(`Добавлено файлов: ${convertedFiles.length}`, 'success');
        } catch (error) {
            console.error('Error converting files:', error);
            
            // Более детальная обработка ошибок
            if (error.message && error.message.includes('File too large')) {
                this.showNotification('Один или несколько файлов слишком большие для обработки. Максимальный размер: 1MB', 'error');
            } else if (error.message && error.message.includes('Failed to read file')) {
                this.showNotification('Ошибка при чтении одного или нескольких файлов. Проверьте, что файлы не повреждены.', 'error');
            } else {
                this.showNotification(`Ошибка при обработке файлов: ${error.message}`, 'error');
            }
        }
    }

    generateFileId(file) {
        // Генерируем уникальный ID для файла
        return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async saveMediaFilesLocally(files) {
        try {
            const totalFileSize = files.reduce((sum, file) => sum + (file.data ? file.data.length : 0), 0);
            const videoCount = files.filter(file => file.type === 'video/mp4').length;
            const imageCount = files.filter(file => file.type.startsWith('image/')).length;
            
            console.log(`📎 Saving ${files.length} files (total size: ${(totalFileSize / 1024 / 1024).toFixed(1)}MB)`);
            console.log(`📎 File types: ${imageCount} images, ${videoCount} videos`);
            
            // Проверяем лимит видео
            if (videoCount > 3) {
                console.warn(`⚠️ Warning: ${videoCount} video files being saved (max: 3). This may cause issues.`);
            }
            
            // Проверяем доступное место в storage
            const storageInfo = await chrome.storage.local.getBytesInUse();
            const storageQuota = chrome.storage.local.QUOTA_BYTES || (100 * 1024 * 1024); // 100MB дефолт
            const availableSpace = storageQuota - storageInfo;
            
            console.log(`📦 Storage status: used ${(storageInfo / 1024 / 1024).toFixed(1)}MB, available ${(availableSpace / 1024 / 1024).toFixed(1)}MB, quota ${(storageQuota / 1024 / 1024).toFixed(1)}MB`);
            
            // Если места недостаточно, удаляем старые файлы
            if (totalFileSize > availableSpace * 0.8) { // Оставляем 20% запаса
                const filesToRemove = await this.makeSpaceForNewFiles(totalFileSize - availableSpace * 0.8);
                if (filesToRemove > 0) {
                    console.log(`🗑️ Removed ${filesToRemove} old files to make space`);
                }
            }
            
            // Сохраняем файлы батчами для распределения нагрузки
            const batchSize = 5; // Сохраняем по 5 файлов за раз
            const batches = [];
            
            for (let i = 0; i < files.length; i += batchSize) {
                batches.push(files.slice(i, i + batchSize));
            }
            
            console.log(`📦 Processing ${files.length} files in ${batches.length} batches of ${batchSize}`);
            
            let totalSuccessful = 0;
            let totalFailed = 0;
            const allResults = [];
            
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} files)`);
                
                // Сохраняем файлы в батче
                const batchOperations = batch.map(async (file, index) => {
                    try {
                        const key = `mediaFile_${file.id}`;
                        await chrome.storage.local.set({ [key]: file.data });
                        const globalIndex = batchIndex * batchSize + index + 1;
                        console.log(`📎 Saved file ${globalIndex}/${files.length}: ${file.name} (${(file.data.length / 1024).toFixed(0)}KB)`);
                        return { success: true, file: file.name };
                    } catch (error) {
                        console.error(`❌ Failed to save file ${file.name}:`, error);
                        return { error: error.message, file: file.name };
                    }
                });
                
                const batchResults = await Promise.all(batchOperations);
                allResults.push(...batchResults);
                
                // Подсчитываем результаты батча
                const batchSuccessful = batchResults.filter(r => r && r.success).length;
                const batchFailed = batchResults.filter(r => r && r.error).length;
                
                totalSuccessful += batchSuccessful;
                totalFailed += batchFailed;
                
                console.log(`📦 Batch ${batchIndex + 1} completed: ${batchSuccessful} success, ${batchFailed} failed`);
                
                // Небольшая пауза между батчами для распределения нагрузки
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            // Показываем общие результаты
            if (totalFailed > 0) {
                console.warn(`⚠️ ${totalFailed} files failed to save, ${totalSuccessful} succeeded`);
                
                // Проверяем, есть ли ошибки квоты
                const quotaErrors = allResults.filter(r => r && r.error && r.error.includes('quota')).length;
                if (quotaErrors > 0) {
                    this.showNotification(`⚠️ ${quotaErrors} файлов не сохранено из-за нехватки места в хранилище. ${totalSuccessful} файлов сохранено успешно.`, 'warning');
                } else {
                    this.showNotification(`Сохранено файлов: ${totalSuccessful} из ${files.length}. ${totalFailed} файлов пропущено из-за ошибок.`, 'warning');
                }
            } else {
                console.log(`✅ Successfully saved all ${files.length} media files to local storage`);
                this.showNotification(`✅ Успешно сохранено ${files.length} файлов`, 'success');
            }
            
            return { successful: totalSuccessful, failed: totalFailed };
        } catch (error) {
            console.error('Error saving media files locally:', error);
            throw error;
        }
    }

    async cleanupFailedFiles(files) {
        try {
            console.log('🧹 Cleaning up failed files...');
            const cleanupPromises = files.map(async (file) => {
                try {
                    const key = `mediaFile_${file.id}`;
                    await chrome.storage.local.remove([key]);
                } catch (error) {
                    // Игнорируем ошибки при очистке
                }
            });
            await Promise.all(cleanupPromises);
            console.log('✅ Cleanup completed');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
    
    async makeSpaceForNewFiles(requiredSpace) {
        try {
            console.log(`🗑️ Need to free ${(requiredSpace / 1024 / 1024).toFixed(1)}MB of space`);
            
            const files = this.settings.selectedMediaFiles || [];
            if (files.length === 0) {
                console.log('🗑️ No files to remove');
                return 0;
            }
            
            // Сортируем файлы по размеру (от больших к маленьким) и по дате (старые сначала)
            const sortedFiles = files.sort((a, b) => {
                // Сначала удаляем большие файлы
                if (b.size !== a.size) {
                    return b.size - a.size;
                }
                // Затем старые файлы
                return (a.lastModified || 0) - (b.lastModified || 0);
            });
            
            let freedSpace = 0;
            let removedCount = 0;
            const filesToRemove = [];
            
            // Удаляем файлы пока не освободим достаточно места
            for (const file of sortedFiles) {
                if (freedSpace >= requiredSpace) {
                    break;
                }
                
                filesToRemove.push(file);
                freedSpace += file.size;
                removedCount++;
            }
            
            if (filesToRemove.length === 0) {
                console.log('🗑️ No files can be removed to free space');
                return 0;
            }
            
            console.log(`🗑️ Removing ${removedCount} files to free ${(freedSpace / 1024 / 1024).toFixed(1)}MB`);
            
            // Удаляем файлы из storage
            const removePromises = filesToRemove.map(async (file) => {
                if (file.id) {
                    try {
                        const key = `mediaFile_${file.id}`;
                        await chrome.storage.local.remove([key]);
                        console.log(`🗑️ Removed file: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`);
                    } catch (error) {
                        console.error(`Error removing file ${file.name}:`, error);
                    }
                }
            });
            
            await Promise.all(removePromises);
            
            // Убираем файлы из списка
            this.settings.selectedMediaFiles = files.filter(file => 
                !filesToRemove.some(removed => removed.id === file.id)
            );
            
            // Обновляем UI и сохраняем настройки
            this.updateSelectedFilesList();
            this.autoSave();
            
            this.showNotification(`🗑️ Автоматически удалено ${removedCount} старых файлов для освобождения места`, 'info');
            console.log(`✅ Freed ${(freedSpace / 1024 / 1024).toFixed(1)}MB by removing ${removedCount} files`);
            
            return removedCount;
        } catch (error) {
            console.error('Error making space for new files:', error);
            return 0;
        }
    }
    
    async optimizeStorage() {
        try {
            console.log('🔧 Starting storage optimization...');
            
            // Проверяем текущее использование
            const storageInfo = await chrome.storage.local.getBytesInUse();
            const storageQuota = chrome.storage.local.QUOTA_BYTES || (100 * 1024 * 1024);
            const usagePercent = (storageInfo / storageQuota) * 100;
            
            console.log(`📦 Current storage: ${(storageInfo / 1024 / 1024).toFixed(1)}MB / ${(storageQuota / 1024 / 1024).toFixed(1)}MB (${usagePercent.toFixed(1)}%)`);
            
            if (usagePercent < 50) {
                this.showNotification('ℹ️ Хранилище используется менее чем на 50%. Оптимизация не требуется.', 'info');
                return;
            }
            
            // Определяем, сколько места нужно освободить
            const targetUsage = 60; // Целевое использование 60%
            const targetSpace = storageQuota * (targetUsage / 100);
            const spaceToFree = Math.max(0, storageInfo - targetSpace);
            
            if (spaceToFree === 0) {
                this.showNotification('ℹ️ Хранилище уже оптимизировано.', 'info');
                return;
            }
            
            console.log(`🔧 Need to free ${(spaceToFree / 1024 / 1024).toFixed(1)}MB to reach ${targetUsage}% usage`);
            
            // Освобождаем место
            const removedCount = await this.makeSpaceForNewFiles(spaceToFree);
            
            if (removedCount > 0) {
                this.showNotification(`✅ Оптимизация завершена! Удалено ${removedCount} файлов.`, 'success');
            } else {
                this.showNotification('ℹ️ Оптимизация не требуется или не удалось освободить место.', 'info');
            }
            
        } catch (error) {
            console.error('Error optimizing storage:', error);
            this.showNotification('Ошибка при оптимизации хранилища', 'error');
        }
    }

    async loadMediaFilesLocally() {
        try {
            // Загружаем файлы из local storage
            const fileMetadata = this.settings.selectedMediaFiles || [];
            const loadedFiles = [];
            
            for (const meta of fileMetadata) {
                if (meta.id) {
                    const key = `mediaFile_${meta.id}`;
                    const result = await chrome.storage.local.get([key]);
                    if (result[key]) {
                        loadedFiles.push({
                            ...meta,
                            data: result[key]
                        });
                    }
                }
            }
            
            // Проверяем лимиты загруженных файлов
            const videoCount = loadedFiles.filter(file => file.type === 'video/mp4').length;
            const imageCount = loadedFiles.filter(file => file.type.startsWith('image/')).length;
            
            console.log(`📎 Loaded ${loadedFiles.length} files from local storage: ${imageCount} images, ${videoCount}/3 videos`);
            
            // Предупреждение если превышен лимит видео
            if (videoCount > 3) {
                console.warn(`⚠️ Video limit exceeded in loaded files: ${videoCount} videos (max: 3)`);
            }
            
            return loadedFiles;
        } catch (error) {
            console.error('Error loading media files locally:', error);
            return [];
        }
    }

        updateSelectedFilesList() {
        const listElement = document.getElementById('selectedFilesList');
        if (!listElement) return;
        
        const files = this.settings.selectedMediaFiles || [];
        if (files.length === 0) {
            listElement.innerHTML = `<div style="text-align:center;color:#999;padding:10px;font-style:italic;">Файлы не выбраны</div>`;
        } else {
            const totalSize = files.reduce((sum, file) => sum + file.size, 0);
            
            // Заголовок с информацией
            const videoFiles = files.filter(file => file.type === 'video/mp4').length;
            const imageFiles = files.filter(file => file.type.startsWith('image/')).length;
            
            // Проверяем превышение лимита видео
            const videoLimitExceeded = videoFiles > 3;
            const headerBackground = videoLimitExceeded ? '#fff3cd' : '#e8f4fd';
            const headerColor = videoLimitExceeded ? '#856404' : '#0066cc';
            
            const header = `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:${headerBackground};border-radius:4px;margin-bottom:8px;font-weight:bold;color:${headerColor};font-size:11px;">
                <span>📁 ${files.length}/50 файлов</span>
                <span>🖼️ ${imageFiles} | 🎥 ${videoFiles}/3${videoLimitExceeded ? ' ⚠️' : ''}</span>
                <span>💾 ${(totalSize / 1024 / 1024).toFixed(1)} MB</span>
            </div>`;
            
            // Показываем предупреждение если превышен лимит видео
            if (videoLimitExceeded) {
                const warningElement = document.createElement('div');
                warningElement.style.cssText = 'padding:4px 8px;background:#fff3cd;border-radius:4px;margin-bottom:8px;font-size:10px;color:#856404;text-align:center;';
                warningElement.innerHTML = `⚠️ <strong>Внимание:</strong> Превышен лимит видео файлов (${videoFiles}/3). Удалите лишние видео для корректной работы.`;
                listElement.insertBefore(warningElement, listElement.firstChild);
            }
            
            // Показываем информацию о доступных слотах для видео
            if (videoFiles < 3) {
                const infoElement = document.createElement('div');
                infoElement.style.cssText = 'padding:4px 8px;background:#d1ecf1;border-radius:4px;margin-bottom:8px;font-size:10px;color:#0c5460;text-align:center;';
                infoElement.innerHTML = `ℹ️ <strong>Информация:</strong> Можно добавить еще ${3 - videoFiles} видео файл(ов)`;
                listElement.insertBefore(infoElement, listElement.firstChild);
            }
            
            // Список файлов с ограниченной высотой и прокруткой
            const fileList = `<div style="max-height:120px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;background:#fafafa;">
                ${files.map((file, index) => {
                    const fileName = file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name;
                    const fileIcon = file.type.startsWith('image/') ? '🖼️' : (file.type.startsWith('video/') ? '🎥' : '📄');
                    
                    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid #eee;last-child:border-bottom:none;">
                        <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;">
                            <span style="font-size:12px;">${fileIcon}</span>
                            <div style="flex:1;min-width:0;">
                                <div style="font-size:11px;font-weight:500;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${file.name}">${fileName}</div>
                                <div style="font-size:9px;color:#666;">${(file.size / 1024).toFixed(0)}KB</div>
                            </div>
                        </div>
                        <button onclick="threadsAISettings.removeMediaFile(${index})" 
                                style="background:#dc3545;color:white;border:none;border-radius:50%;width:16px;height:16px;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;" 
                                title="Удалить файл">×</button>
                    </div>`;
                }).join('')}
            </div>`;
            
            listElement.innerHTML = header + fileList;
        }
    }

    async removeMediaFile(index) {
        if (this.settings.selectedMediaFiles && index >= 0 && index < this.settings.selectedMediaFiles.length) {
            const fileToRemove = this.settings.selectedMediaFiles[index];
            
            // Удаляем файл из local storage
            if (fileToRemove.id) {
                try {
                    const key = `mediaFile_${fileToRemove.id}`;
                    await chrome.storage.local.remove([key]);
                    console.log(`✅ Removed file ${fileToRemove.name} from local storage`);
                } catch (error) {
                    console.error('Error removing file from local storage:', error);
                }
            }
            
            // Удаляем метаданные из настроек
            this.settings.selectedMediaFiles.splice(index, 1);
            this.updateSelectedFilesList();
            this.autoSave();
            
            // Показываем информацию о лимитах после удаления
            const remainingFiles = this.settings.selectedMediaFiles || [];
            const remainingVideos = remainingFiles.filter(file => file.type === 'video/mp4').length;
            const remainingImages = remainingFiles.filter(file => file.type.startsWith('image/')).length;
            
            console.log(`📎 After removal: ${remainingFiles.length} total files (${remainingImages} images, ${remainingVideos}/3 videos)`);
            
            // Если удалили видео и теперь можно добавить еще
            if (fileToRemove.type === 'video/mp4' && remainingVideos < 3) {
                this.showNotification(`Видео файл удален. Теперь можно добавить еще ${3 - remainingVideos} видео файл(ов).`, 'info');
            }
            
            // Если удалили изображение, показываем общую информацию
            if (fileToRemove.type.startsWith('image/')) {
                console.log(`📎 Image file removed. Remaining: ${remainingImages} images, ${remainingVideos}/3 videos`);
            }
        }
    }

    async clearMediaFiles() {
        // Удаляем все файлы из local storage
        const files = this.settings.selectedMediaFiles || [];
        const removalPromises = files.map(async (file) => {
            if (file.id) {
                const key = `mediaFile_${file.id}`;
                return chrome.storage.local.remove([key]);
            }
        });
        
        try {
            await Promise.all(removalPromises);
            console.log(`✅ Removed ${files.length} files from local storage`);
        } catch (error) {
            console.error('Error clearing files from local storage:', error);
        }
        
        // Очищаем метаданные
        this.settings.selectedMediaFiles = [];
        const fileInput = document.getElementById('mediaFiles');
        if (fileInput) fileInput.value = '';
        this.updateSelectedFilesList();
        this.autoSave();
        this.showNotification('Файлы очищены. Теперь можно добавить до 3 видео файлов и неограниченное количество изображений.', 'success');
        console.log('📎 Media files cleared. Ready for new files: up to 3 videos and unlimited images.');
    }
    
    async clearVideoFiles() {
        // Удаляем только видео файлы
        const files = this.settings.selectedMediaFiles || [];
        const videoFiles = files.filter(file => file.type === 'video/mp4');
        
        if (videoFiles.length === 0) {
            this.showNotification('Нет видео файлов для удаления', 'info');
            return;
        }
        
        try {
            // Удаляем видео файлы из local storage
            const removePromises = videoFiles.map(async (file) => {
                if (file.id) {
                    const key = `mediaFile_${file.id}`;
                    try {
                        await chrome.storage.local.remove([key]);
                        console.log(`🗑️ Removed video file: ${file.name}`);
                    } catch (error) {
                        console.error(`Error removing video file ${file.name}:`, error);
                    }
                }
            });
            
            await Promise.all(removePromises);
            
            // Убираем видео файлы из списка
            this.settings.selectedMediaFiles = files.filter(file => file.type !== 'video/mp4');
            this.updateSelectedFilesList();
            this.autoSave();
            
            this.showNotification(`🎥 Удалено ${videoFiles.length} видео файлов. Теперь можно добавить еще ${3 - (files.length - videoFiles.length)} видео файл(ов).`, 'success');
            console.log(`✅ Cleared ${videoFiles.length} video files`);
        } catch (error) {
            console.error('Error clearing video files:', error);
            this.showNotification('Ошибка при удалении видео файлов', 'error');
        }
    }

    async saveSettings() {
        try {
            const formData = this.getFormData();

            await chrome.storage.sync.set(formData);
            this.settings = formData;

            this.showNotification('Настройки сохранены!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification(this.t('settingsSaveError'), 'error');
        }
    }

    async autoSave() {
        // Auto-save with debounce
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(async () => {
            try {
                const formData = this.getFormData();
                await chrome.storage.sync.set(formData);
            } catch (error) {
                console.error('Auto-save error:', error);
            }
        }, 1000);
    }

    getFormData() {
        const commentsTemplate = document.getElementById('commentsTemplate').value
            .split('\n')
            .map(c => c.trim())
            .filter(c => c.length > 0);

        return {
            maxPosts: parseInt(document.getElementById('maxPosts').value),
            minDelay: parseInt(document.getElementById('minDelay').value),
            maxDelay: parseInt(document.getElementById('maxDelay').value),
            autoLike: document.getElementById('autoLike').checked,
            stealthMode: document.getElementById('stealthMode').checked,
            respectLimits: document.getElementById('respectLimits').checked,
            avoidDuplicates: document.getElementById('avoidDuplicates').checked,
            avoidDuplicateUsers: document.getElementById('avoidDuplicateUsers').checked,
            enableFirstCommentMode: document.getElementById('enableFirstCommentMode').checked,
            firstCommentPrompt: document.getElementById('firstCommentPrompt').value,
            firstCommentPriority: document.getElementById('firstCommentPriority').checked,
            firstCommentMaxLength: parseInt(document.getElementById('firstCommentMaxLength').value),
            actionsPerHour: parseInt(document.getElementById('actionsPerHour').value),
            // AI Settings
            enableAI: document.getElementById('enableAI').checked,
            aiProvider: document.getElementById('aiProvider').value,
            openaiApiKey: document.getElementById('openaiApiKey').value,
            openaiModel: document.getElementById('openaiModel').value,
            openrouterApiKey: document.getElementById('openrouterApiKey').value,
            openrouterModel: document.getElementById('openrouterModel').value,
            groqApiKey: document.getElementById('groqApiKey').value,
            groqModel: document.getElementById('groqModel').value,
            groqCustomModel: document.getElementById('groqCustomModel').value,
            geminiApiKey: document.getElementById('geminiApiKey').value,
            geminiModel: document.getElementById('geminiModel').value,
            geminiCustomModel: document.getElementById('geminiCustomModel').value,
            customModel: document.getElementById('customModel').value,
            aiPrompt: document.getElementById('aiPrompt').value,
            comments: commentsTemplate,
            // Post Filter Settings
            enablePostFilter: document.getElementById('enablePostFilter').checked,
            minLikes: parseInt(document.getElementById('minLikes').value) || 0,
            maxLikes: parseInt(document.getElementById('maxLikes').value) || 50000,
            minComments: parseInt(document.getElementById('minComments').value) || 0,
            maxComments: parseInt(document.getElementById('maxComments').value) || 5000,
                    // Date Filter Settings
        enableDateFilter: document.getElementById('enableDateFilter').checked,
        dateFilterFrom: parseInt(document.getElementById('dateFilterFrom').value) || 0,
        dateFilterTo: parseInt(document.getElementById('dateFilterTo').value) || 24,
        maxScrollAttempts: parseInt(document.getElementById('maxScrollAttempts').value) || 20,
            // Content Type Filters
            filterPhotoOnly: document.getElementById('filterPhotoOnly').checked,
            filterVideoOnly: document.getElementById('filterVideoOnly').checked,
            filterTextMedia: document.getElementById('filterTextMedia').checked,
            filterTextOnly: document.getElementById('filterTextOnly').checked,
            // Keyword Search Settings
            enableKeywordSearch: document.getElementById('enableKeywordSearch').checked,
            searchKeywords: document.getElementById('searchKeywords').value
                .split('\n')
                .map(k => k.trim())
                .filter(k => k.length > 0),
            searchSection: document.getElementById('searchSection').value,
            maxPostsPerKeyword: parseInt(document.getElementById('maxPostsPerKeyword').value) || 10,
            keywordDelay: parseInt(document.getElementById('keywordDelay').value) || 30,
            randomizeKeywords: document.getElementById('randomizeKeywords').checked,
            cyclicSearch: document.getElementById('cyclicSearch').checked,
            // Language Filter Settings
            enableLanguageFilter: document.getElementById('enableLanguageFilter').checked,
            allowedLanguages: [
                ...(document.getElementById('languageRussian').checked ? ['russian'] : []),
                ...(document.getElementById('languageUkrainian').checked ? ['ukrainian'] : []),
                ...(document.getElementById('languageEnglish').checked ? ['english'] : []),
                ...(document.getElementById('languageHieroglyphs').checked ? ['hieroglyphs'] : [])
            ],
            excludedLanguages: [
                ...(document.getElementById('excludeLanguageRussian').checked ? ['russian'] : []),
                ...(document.getElementById('excludeLanguageUkrainian').checked ? ['ukrainian'] : []),
                ...(document.getElementById('excludeLanguageEnglish').checked ? ['english'] : []),
                ...(document.getElementById('excludeLanguageHieroglyphs').checked ? ['hieroglyphs'] : [])
            ],
            // User Filter Settings
            enableUserFilter: document.getElementById('enableUserFilter').checked,
            onlyVerified: document.getElementById('onlyVerified').checked,
            excludeVerified: document.getElementById('excludeVerified').checked,
            onlyWithAvatar: document.getElementById('onlyWithAvatar').checked,
            excludeWithAvatar: document.getElementById('excludeWithAvatar').checked,
            // Media Attachment Settings
            enableAttachMedia: document.getElementById('enableAttachMedia').checked,
            selectedMediaFiles: this.settings.selectedMediaFiles || [],
            deleteMediaAfterUse: document.getElementById('deleteMediaAfterUse').checked,
            useAllMediaFiles: document.getElementById('useAllMediaFiles').checked,
            randomMediaOrder: document.getElementById('randomMediaOrder').checked
        };
        
        // Проверяем лимиты медиа файлов при получении данных формы
        const mediaFiles = this.settings.selectedMediaFiles || [];
        if (mediaFiles.length > 0) {
            const videoCount = mediaFiles.filter(file => file.type === 'video/mp4').length;
            const imageCount = mediaFiles.filter(file => file.type.startsWith('image/')).length;
            
            console.log(`📎 Form data: ${mediaFiles.length} media files (${imageCount} images, ${videoCount}/3 videos)`);
            
            // Предупреждение если превышен лимит видео
            if (videoCount > 3) {
                console.warn(`⚠️ Video limit exceeded in form data: ${videoCount} videos (max: 3)`);
            }
        }
    }

    async testSettings() {
        try {
            // Validate settings
            const formData = this.getFormData();
            
            const errors = [];
            
            if (formData.maxPosts < 1 || formData.maxPosts > 500) {
                errors.push('Максимум постов должен быть от 1 до 500');
            }
            
            if (formData.minDelay >= formData.maxDelay) {
                errors.push('Минимальная задержка должна быть меньше максимальной');
            }
            
            if (formData.actionsPerHour < 1 || formData.actionsPerHour > 50) {
                errors.push('Действий в час должно быть от 1 до 50');
            }
            
            if (formData.comments.length === 0) {
                errors.push('Необходимо добавить хотя бы один комментарий');
            }

            if (errors.length > 0) {
                this.showNotification('Ошибки в настройках:\n' + errors.join('\n'), 'error');
                return;
            }

            // Test passed
            this.showNotification('✅ Все настройки корректны!', 'success');
            
            // Проверяем лимиты медиа файлов
            const mediaFiles = formData.selectedMediaFiles || [];
            let mediaSummary = '';
            if (mediaFiles.length > 0) {
                const videoCount = mediaFiles.filter(file => file.type === 'video/mp4').length;
                const imageCount = mediaFiles.filter(file => file.type.startsWith('image/')).length;
                mediaSummary = `
• Медиа файлы: ${mediaFiles.length} (${imageCount} изображений, ${videoCount}/3 видео)
                `.trim();
                
                // Предупреждение если превышен лимит видео
                if (videoCount > 3) {
                    this.showNotification(`⚠️ Внимание: превышен лимит видео файлов (${videoCount}/3). Это может вызвать проблемы.`, 'warning');
                }
            }
            
            // Show test summary
            const summary = `
Тест настроек пройден успешно:
• Максимум постов: ${formData.maxPosts}
• Задержка: ${formData.minDelay}-${formData.maxDelay} сек
• Действий в час: ${formData.actionsPerHour}
• Комментариев: ${this.comments.length}
• Автолайки: ${formData.autoLike ? 'Включены' : 'Отключены'}
• Скрытный режим: ${formData.stealthMode ? 'Включен' : 'Отключен'}${mediaSummary ? '\n' + mediaSummary : ''}
            `.trim();
            
            console.log(summary);

        } catch (error) {
            console.error('Test error:', error);
            this.showNotification('Ошибка тестирования настроек', 'error');
        }
    }

    async exportSettings() {
        try {
            const allSettings = await chrome.storage.sync.get();
            const exportData = {
                ...allSettings,
                exportDate: new Date().toISOString(),
                version: '5.23'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `threadsai-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Настройки экспортированы!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Ошибка экспорта настроек', 'error');
        }
    }

    async importSettings(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            // Validate import data
            if (!importData.maxPosts || !importData.comments) {
                throw new Error('Неверный формат файла настроек');
            }

            // Remove metadata
            delete importData.exportDate;
            delete importData.version;

            // Save imported settings
            await chrome.storage.sync.set(importData);
            
            // Проверяем лимиты медиа файлов в импортированных настройках
            const mediaFiles = importData.selectedMediaFiles || [];
            if (mediaFiles.length > 0) {
                const videoCount = mediaFiles.filter(file => file.type === 'video/mp4').length;
                const imageCount = mediaFiles.filter(file => file.type.startsWith('image/')).length;
                
                console.log(`📎 Imported media files: ${mediaFiles.length} total (${imageCount} images, ${videoCount}/3 videos)`);
                
                // Предупреждение если превышен лимит видео
                if (videoCount > 3) {
                    console.warn(`⚠️ Video limit exceeded in imported settings: ${videoCount} videos (max: 3)`);
                    this.showNotification(`⚠️ Внимание: в импортированных настройках превышен лимит видео файлов (${videoCount}/3). Это может вызвать проблемы.`, 'warning');
                }
            }
            
            // Reload settings
            await this.loadSettings();
            this.updateUI();

            this.showNotification('Настройки импортированы!', 'success');
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Ошибка импорта настроек: ' + error.message, 'error');
        }
    }

    async resetSettings() {
        if (!confirm('Вы уверены, что хотите сбросить все настройки? Это действие необратимо.')) {
            return;
        }

        try {
            // Clear all settings
            await chrome.storage.sync.clear();
            
            // Reload default settings
            await this.loadSettings();
            this.updateUI();

            this.showNotification('Настройки сброшены к значениям по умолчанию. Теперь можно добавить до 3 видео файлов и неограниченное количество изображений.', 'success');
            console.log('📎 Settings reset. Ready for new media files: up to 3 videos and unlimited images.');
        } catch (error) {
            console.error('Reset error:', error);
            this.showNotification('Ошибка сброса настроек', 'error');
        }
    }

    async loadStats() {
        try {
            const stats = await chrome.storage.local.get(['stats', 'totalStats']);
            
            if (stats.stats) {
                document.getElementById('totalComments').textContent = stats.stats.comments || 0;
                document.getElementById('totalLikes').textContent = stats.stats.likes || 0;
            }

            if (stats.totalStats) {
                document.getElementById('sessionsCount').textContent = stats.totalStats.sessions || 0;
                document.getElementById('avgPerHour').textContent = 
                    Math.round((stats.totalStats.totalActions || 0) / Math.max(stats.totalStats.totalHours || 1, 1));
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000);
    }

    // AI Settings Methods
    toggleAISettings(enabled) {
        const aiSettingsExpanded = document.getElementById('aiSettingsExpanded');
        const aiPromptSection = document.getElementById('aiPromptSection');
        
        if (enabled) {
            aiSettingsExpanded.style.display = 'block';
            if (aiPromptSection) aiPromptSection.style.display = 'block';
            this.toggleProviderSettings(document.getElementById('aiProvider').value);
        } else {
            aiSettingsExpanded.style.display = 'none';
            if (aiPromptSection) aiPromptSection.style.display = 'none';
        }
    }

    toggleMediaSettings(enabled) {
        const mediaDetailsSection = document.getElementById('mediaDetailsSection');
        if (mediaDetailsSection) {
            if (enabled) {
                mediaDetailsSection.style.display = 'block';
            } else {
                mediaDetailsSection.style.display = 'none';
            }
        }
    }

    toggleProviderSettings(provider) {
        const openaiSettings = document.getElementById('openaiSettingsExpanded');
        const openrouterSettings = document.getElementById('openrouterSettingsExpanded');
        const groqSettings = document.getElementById('groqSettingsExpanded');
        const geminiSettings = document.getElementById('geminiSettingsExpanded');
        
        // Hide all provider settings
        openaiSettings.style.display = 'none';
        openrouterSettings.style.display = 'none';
        groqSettings.style.display = 'none';
        geminiSettings.style.display = 'none';
        
        // Show selected provider settings
        if (provider === 'openai') {
            openaiSettings.style.display = 'block';
        } else if (provider === 'openrouter') {
            openrouterSettings.style.display = 'block';
            this.toggleCustomModel(document.getElementById('openrouterModel').value);
        } else if (provider === 'groq') {
            groqSettings.style.display = 'block';
        } else if (provider === 'gemini') {
            geminiSettings.style.display = 'block';
        }
    }

    toggleCustomModel(model) {
        const customModelSection = document.getElementById('customModelSectionExpanded');
        if (model === 'custom') {
            customModelSection.style.display = 'block';
        } else {
            customModelSection.style.display = 'none';
        }
    }

    toggleGroqCustomModel(model) {
        const groqCustomModelSection = document.getElementById('groqCustomModelSection');
        if (model === 'custom') {
            groqCustomModelSection.style.display = 'block';
        } else {
            groqCustomModelSection.style.display = 'none';
        }
    }

    toggleGeminiCustomModel(model) {
        const geminiCustomModelSection = document.getElementById('geminiCustomModelSection');
        if (model === 'custom') {
            geminiCustomModelSection.style.display = 'block';
        } else {
            geminiCustomModelSection.style.display = 'none';
        }
    }

    // API Key Validation Methods
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

    togglePostFilterSettings(enabled) {
        const postFilterSettings = document.getElementById('postFilterSettingsExpanded');
        
        if (enabled) {
            postFilterSettings.style.display = 'block';
        } else {
            postFilterSettings.style.display = 'none';
        }
    }

    toggleDateFilterSettings(enabled) {
        const dateFilterControls = document.getElementById('dateFilterControls');
        
        if (enabled) {
            dateFilterControls.style.display = 'block';
        } else {
            dateFilterControls.style.display = 'none';
        }
    }

    toggleKeywordSearchSettings(enabled) {
        const keywordSearchSettings = document.getElementById('keywordSearchSettingsExpanded');
        
        if (enabled) {
            keywordSearchSettings.style.display = 'block';
        } else {
            keywordSearchSettings.style.display = 'none';
        }
    }

    toggleLanguageFilterSettings(enabled) {
        const languageFilterSettings = document.getElementById('languageFilterSettingsExpanded');
        
        if (enabled) {
            languageFilterSettings.style.display = 'block';
        } else {
            languageFilterSettings.style.display = 'none';
        }
    }

    toggleUserFilterSettings(enabled) {
        const userFilterSettings = document.getElementById('userFilterSettingsExpanded');
        
        if (enabled) {
            userFilterSettings.style.display = 'block';
        } else {
            userFilterSettings.style.display = 'none';
        }
    }



    toggleFirstCommentSettings(enabled) {
        const firstSettings = document.getElementById('firstCommentSettingsExpanded');
        if (!firstSettings) return;
        firstSettings.style.display = enabled ? 'block' : 'none';
    }

    updateCommentCount() {
        const commentsTemplate = document.getElementById('commentsTemplate');
        const commentCountExpanded = document.getElementById('commentCountExpanded');
        
        if (commentsTemplate && commentCountExpanded) {
            const comments = commentsTemplate.value
                .split('\n')
                .map(c => c.trim())
                .filter(c => c.length > 0);
            commentCountExpanded.textContent = comments.length;
        }
    }

    updateKeywordCount() {
        const searchKeywords = document.getElementById('searchKeywords');
        const keywordCount = document.getElementById('keywordCount');
        
        if (searchKeywords && keywordCount) {
            const keywords = searchKeywords.value
                .split('\n')
                .map(k => k.trim())
                .filter(k => k.length > 0);
            
            keywordCount.textContent = keywords.length;
        }
    }

    async testPrompt() {
        const testBtn = document.getElementById('testPromptBtn');
        const resultDiv = document.getElementById('promptTestResult');
        const contentDiv = document.getElementById('promptTestContent');
        const testPostInput = document.getElementById('testPostText');
        const promptTextarea = document.getElementById('aiPrompt');

        // Get current values
        const testPostText = testPostInput.value.trim();
        const promptTemplate = promptTextarea.value.trim();
        const aiProvider = document.getElementById('aiProvider').value;

        // Validation
        if (!testPostText) {
            this.showNotification(this.t('promptTestError') + ' ' + 'Введите текст поста для тестирования', 'error');
            return;
        }

        if (!promptTemplate) {
            this.showNotification(this.t('promptTestError') + ' ' + 'Введите промт для тестирования', 'error');
            return;
        }

        // Check API keys
        const apiKeyInputId = aiProvider + 'ApiKey';
        const apiKey = document.getElementById(apiKeyInputId)?.value?.trim();
        
        if (!apiKey) {
            this.showNotification(this.t('promptTestError') + ' ' + `Введите API ключ для ${aiProvider}`, 'error');
            return;
        }

        // Update UI
        testBtn.disabled = true;
        testBtn.textContent = this.t('promptTesting');
        resultDiv.style.display = 'block';
        contentDiv.textContent = this.t('promptTesting');

        try {
            // Prepare the prompt with actual post text
            const finalPrompt = promptTemplate.replace(/{POST_TEXT}/g, testPostText);

            // Get model based on provider
            let model;
            switch (aiProvider) {
                case 'openai':
                    model = document.getElementById('openaiModel').value;
                    break;
                case 'openrouter':
                    model = document.getElementById('openrouterModel').value;
                    if (model === 'custom') {
                        model = document.getElementById('customModel').value.trim();
                        if (!model) {
                            throw new Error('Введите название кастомной модели OpenRouter');
                        }
                    }
                    break;
                case 'groq':
                    model = document.getElementById('groqModel').value;
                    if (model === 'custom') {
                        model = document.getElementById('groqCustomModel').value.trim();
                        if (!model) {
                            throw new Error('Введите название кастомной модели Groq');
                        }
                    }
                    break;
                case 'gemini':
                    model = document.getElementById('geminiModel').value;
                    if (model === 'custom') {
                        model = document.getElementById('geminiCustomModel').value.trim();
                        if (!model) {
                            throw new Error('Введите название кастомной модели Gemini');
                        }
                    }
                    break;
                default:
                    throw new Error('Неподдерживаемый провайдер AI');
            }

            // Call AI API
            const result = await this.callAIForTesting(aiProvider, apiKey, model, finalPrompt);
            
            // Show result
            contentDiv.textContent = result;
            this.showNotification(this.t('promptTestSuccess'), 'success');

        } catch (error) {
            console.error('Prompt test error:', error);
            contentDiv.textContent = this.t('promptTestError') + ' ' + error.message;
            this.showNotification(this.t('promptTestError') + ' ' + error.message, 'error');
        } finally {
            // Restore button
            testBtn.disabled = false;
            testBtn.textContent = this.t('testPrompt');
        }
    }

    async callAIForTesting(provider, apiKey, model, prompt) {
        // Define fallback models for each provider
        const fallbackModels = {
            groq: ['llama-3.1-8b-instant', 'gemma2-9b-it', 'llama3-8b-8192'],
            openai: ['gpt-4o-mini', 'gpt-3.5-turbo'],
            openrouter: ['openai/gpt-4o-mini', 'openai/gpt-3.5-turbo', 'meta-llama/llama-3.1-8b-instruct:free'],
            gemini: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-lite']
        };

        const modelsToTry = [model, ...(fallbackModels[provider] || [])].filter((m, i, arr) => arr.indexOf(m) === i);

        let lastError = null;

        for (const currentModel of modelsToTry) {
            try {
                const result = await this.makeAIRequest(provider, apiKey, currentModel, prompt);
                
                // If we used a fallback model, update the UI and save settings
                if (currentModel !== model) {
                    console.log(`🔄 Switched from ${model} to ${currentModel} due to model availability`);
                    this.updateModelInUI(provider, currentModel);
                    await this.saveModelFallback(provider, currentModel);
                }
                
                return result;
            } catch (error) {
                console.log(`❌ Model ${currentModel} failed:`, error.message);
                lastError = error;
                continue;
            }
        }

        // If all models failed, throw the last error
        throw lastError || new Error('Все модели недоступны');
    }

    async makeAIRequest(provider, apiKey, model, prompt) {
        let requestBody = {
            model: model,
            messages: [{
                role: 'user',
                content: prompt
            }],
            max_tokens: 200,
            temperature: 0.7
        };

        let url, headers;

        switch (provider) {
            case 'openai':
                url = 'https://api.openai.com/v1/chat/completions';
                headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };
                break;

            case 'openrouter':
                url = 'https://openrouter.ai/api/v1/chat/completions';
                headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://threads.com',
                    'X-Title': 'ThreadsAI Extension'
                };
                break;

            case 'groq':
                url = 'https://api.groq.com/openai/v1/chat/completions';
                headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };
                break;

            case 'gemini':
                url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                headers = {
                    'Content-Type': 'application/json'
                };
                // Gemini has different request format
                requestBody = {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 200,
                        temperature: 0.7
                    }
                };
                break;

            default:
                throw new Error(`Неподдерживаемый провайдер: ${provider}`);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || 
                               errorData.message || 
                               `HTTP ${response.status}`;
            
            // Check for model not found errors
            if (response.status === 404 || 
                errorMessage.includes('does not exist') || 
                errorMessage.includes('not found') ||
                errorMessage.includes('не существует')) {
                throw new Error(`MODEL_NOT_FOUND: ${errorMessage}`);
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (provider === 'gemini') {
            // Handle Gemini response format
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Неверный формат ответа от Gemini API');
            }
            
            const content = data.candidates[0].content;
            if (!content.parts || !content.parts[0]) {
                throw new Error('Неверный формат ответа от Gemini API');
            }
            
            return content.parts[0].text.trim();
        } else {
            // Handle OpenAI-compatible response format
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Неверный формат ответа от API');
            }
            
            return data.choices[0].message.content.trim();
        }
    }

    updateModelInUI(provider, newModel) {
        const modelSelectId = provider + 'Model';
        const modelSelect = document.getElementById(modelSelectId);
        if (modelSelect) {
            modelSelect.value = newModel;
            // Visual indication that model was changed
            modelSelect.style.background = '#fff3cd';
            setTimeout(() => {
                modelSelect.style.background = '';
            }, 2000);
        }
    }

    async saveModelFallback(provider, newModel) {
        try {
            const settingKey = provider + 'Model';
            await chrome.storage.sync.set({ [settingKey]: newModel });
            this.settings[settingKey] = newModel;
            this.showNotification(`🔄 Модель автоматически переключена на ${newModel}`, 'warning');
        } catch (error) {
            console.error('Error saving fallback model:', error);
        }
    }

    copyTestResult() {
        const contentDiv = document.getElementById('promptTestContent');
        const text = contentDiv.textContent;

        if (!text || text === this.t('promptTesting')) {
            this.showNotification('Нет результата для копирования', 'warning');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            this.showNotification(this.t('resultCopied'), 'success');
        }).catch(err => {
            console.error('Failed to copy text:', err);
            this.showNotification('Ошибка копирования в буфер обмена', 'error');
        });
    }
}

// Initialize settings page
let settingsApp;
let threadsAISettings; // Global reference for HTML buttons
document.addEventListener('DOMContentLoaded', () => {
    settingsApp = new ThreadsAISettings();
    threadsAISettings = settingsApp; // Make it globally accessible
});