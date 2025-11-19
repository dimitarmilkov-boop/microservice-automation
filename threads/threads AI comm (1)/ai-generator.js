// AI Comment Generator
class AICommentGenerator {
    constructor() {
        this.providers = {
            openai: new OpenAIProvider(),
            openrouter: new OpenRouterProvider(),
            groq: new GroqProvider(),
            gemini: new GeminiProvider(),
            // Будущие провайдеры
            // anthropic: new AnthropicProvider()
        };
    }

    async generateComment(postText, settings) {
        try {
            if (!settings.enableAI) {
                throw new Error('AI generation is disabled');
            }

            const provider = this.providers[settings.aiProvider];
            if (!provider) {
                throw new Error(`Unknown AI provider: ${settings.aiProvider}`);
            }

            console.log(`🤖 Generating comment using ${settings.aiProvider}...`);
            console.log(`Post text (first 100 chars): "${postText.substring(0, 100)}..."`);

            const comment = await provider.generateComment(postText, settings);
            
            console.log(`✅ AI generated comment: "${comment}"`);
            return comment;

        } catch (error) {
            console.error('❌ AI generation failed:', error);
            throw error;
        }
    }

    async testConnection(settings) {
        try {
            const provider = this.providers[settings.aiProvider];
            if (!provider) {
                throw new Error(`Unknown AI provider: ${settings.aiProvider}`);
            }

            return await provider.testConnection(settings);
        } catch (error) {
            console.error('Connection test failed:', error);
            throw error;
        }
    }
}

// OpenAI Provider
class OpenAIProvider {
    constructor() {
        this.baseURL = 'https://api.openai.com/v1';
    }

    async generateComment(postText, settings) {
        const { openaiApiKey, openaiModel, aiPrompt } = settings;

        if (!openaiApiKey) {
            throw new Error('OpenAI API key is required');
        }

        // ALWAYS use the user's custom prompt
        if (!aiPrompt || aiPrompt.trim().length === 0) {
            throw new Error('AI prompt is not configured. Please set a prompt in settings.');
        }
        const finalPrompt = aiPrompt.replace('{POST_TEXT}', postText);
        console.log(`📝 Using user's custom prompt: "${finalPrompt.substring(0, 200)}..."`);

        const requestBody = {
            model: openaiModel,
            messages: [
                {
                    role: 'user',
                    content: finalPrompt
                }
            ],
            max_tokens: 150,
            temperature: 0.8,
            top_p: 1,
            frequency_penalty: 0.3,
            presence_penalty: 0.2
        };

        console.log(`🔗 Making OpenAI request to model: ${openaiModel}`);

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            
            if (response.status === 401) {
                throw new Error('Invalid OpenAI API key');
            } else if (response.status === 429) {
                throw new Error('OpenAI rate limit exceeded');
            } else if (response.status === 402) {
                throw new Error('OpenAI quota exceeded');
            } else {
                throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
            }
        }

        const data = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
            throw new Error('No response from OpenAI');
        }

        let comment = data.choices[0].message.content.trim();
        
        // Clean up the comment
        comment = this.cleanComment(comment);
        
        // Validate comment length
        if (comment.length > 200) {
            comment = comment.substring(0, 197) + '...';
        }
        
        if (comment.length < 3) {
            throw new Error('Generated comment is too short');
        }

        return comment;
    }

    cleanComment(comment) {
        // Remove quotes if the AI wrapped the comment
        comment = comment.replace(/^["']|["']$/g, '');
        
        // Remove common prefixes
        comment = comment.replace(/^(Комментарий:|Comment:|Ответ:|Reply:)\s*/i, '');
        
        // Remove markdown formatting
        comment = comment.replace(/\*\*(.*?)\*\*/g, '$1');
        comment = comment.replace(/\*(.*?)\*/g, '$1');
        
        // Trim and normalize whitespace
        comment = comment.trim().replace(/\s+/g, ' ');
        
        return comment;
    }

    async testConnection(settings) {
        try {
            const response = await this.generateComment(
                'Тестовый пост для проверки подключения', 
                settings
            );
            return { success: true, message: 'Подключение успешно', testComment: response };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// OpenRouter Provider - supports hundreds of AI models
class OpenRouterProvider {
    constructor() {
        this.baseUrl = 'https://openrouter.ai/api/v1';
    }

    async generateComment(postText, settings) {
        const { openrouterApiKey, openrouterModel, customModel, aiPrompt } = settings;
        
        if (!openrouterApiKey) {
            throw new Error('OpenRouter API Key is not set in extension settings.');
        }

        // Use custom model if selected, otherwise use the predefined model
        const model = openrouterModel === 'custom' ? customModel : openrouterModel;
        
        if (!model) {
            throw new Error('No model specified for OpenRouter.');
        }

        // ALWAYS use the user's custom prompt
        if (!aiPrompt || aiPrompt.trim().length === 0) {
            throw new Error('AI prompt is not configured. Please set a prompt in settings.');
        }
        const prompt = aiPrompt.replace('{POST_TEXT}', postText);
        console.log(`📝 Using user's custom prompt: "${prompt.substring(0, 200)}..."`);
        
        console.log(`🔗 Making OpenRouter request to model: ${model}`);

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openrouterApiKey}`,
                    'HTTP-Referer': 'https://threads.com', // For OpenRouter rankings
                    'X-Title': 'ThreadsAI Extension' // For OpenRouter rankings
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.8,
                    top_p: 1.0,
                    frequency_penalty: 0.3,
                    presence_penalty: 0.2
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error?.message || 
                                   errorData.message || 
                                   `HTTP ${response.status}`;
                throw new Error(`OpenRouter API error: ${errorMessage}`);
            }

            const data = await response.json();
            
            console.log(`📥 OpenRouter API response status: ${response.status}`);
            console.log(`📥 OpenRouter response structure:`, data);
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from OpenRouter API');
            }

            const comment = data.choices[0].message.content.trim();
            
            if (!comment) {
                throw new Error('OpenRouter returned empty response');
            }
            
            // Check comment quality
            if (comment.length < 15 || comment.split(/\s+/).length < 5) {
                throw new Error('Generated comment is too short or low quality');
            }

            return comment;

        } catch (error) {
            console.error('Error calling OpenRouter API:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Cannot connect to OpenRouter API. Check your internet connection.');
            }
            
            throw error;
        }
    }

    async testConnection(settings) {
        try {
            const response = await this.generateComment(
                'Тестовый пост для проверки подключения', 
                settings
            );
            return { success: true, message: 'OpenRouter подключение успешно', testComment: response };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Groq Provider - Fast inference AI
class GroqProvider {
    constructor() {
        this.baseUrl = 'https://api.groq.com/openai/v1';
    }

    async generateComment(postText, settings) {
        const { groqApiKey, groqModel, groqCustomModel, aiPrompt } = settings;
        
        if (!groqApiKey) {
            throw new Error('Groq API Key is not set in extension settings.');
        }

        if (!groqModel) {
            throw new Error('No model specified for Groq.');
        }

        // Get actual model name (handle custom model)
        let actualModel = groqModel;
        if (groqModel === 'custom') {
            actualModel = groqCustomModel?.trim();
            if (!actualModel) {
                throw new Error('Custom Groq model name is not specified.');
            }
        }

        // Define fallback models (don't use fallback for custom models)
        const fallbackModels = groqModel === 'custom' ? [] : ['llama-3.1-8b-instant', 'gemma2-9b-it', 'llama3-8b-8192'];
        const modelsToTry = [actualModel, ...fallbackModels].filter((m, i, arr) => arr.indexOf(m) === i);

        let lastError = null;

        for (const currentModel of modelsToTry) {
            try {
                const result = await this.makeRequest(postText, { ...settings, groqModel: currentModel });
                
                // If we used a fallback model, save the working model
                if (currentModel !== groqModel) {
                    console.log(`🔄 Groq: Switched from ${groqModel} to ${currentModel} due to model availability`);
                    this.saveWorkingModel(currentModel);
                }
                
                return result;
            } catch (error) {
                console.log(`❌ Groq model ${currentModel} failed:`, error.message);
                lastError = error;
                
                // Don't try fallbacks for API key errors
                if (error.message.includes('API') || error.message.includes('unauthorized')) {
                    throw error;
                }
                continue;
            }
        }

        // If all models failed, throw the last error
        throw lastError || new Error('Все модели Groq недоступны');
    }

    async makeRequest(postText, settings) {
        const { groqApiKey, groqModel, aiPrompt } = settings;

        // ALWAYS use the user's custom prompt
        if (!aiPrompt || aiPrompt.trim().length === 0) {
            throw new Error('AI prompt is not configured. Please set a prompt in settings.');
        }
        const prompt = aiPrompt.replace('{POST_TEXT}', postText);
        console.log(`📝 Using user's custom prompt: "${prompt.substring(0, 200)}..."`);
        
        console.log(`🔗 Making Groq request to model: ${groqModel}`);

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqApiKey}`
                },
                body: JSON.stringify({
                    model: groqModel,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.8,
                    top_p: 1.0,
                    frequency_penalty: 0.3,
                    presence_penalty: 0.2
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || 
                                   errorData.message || 
                                   `HTTP ${response.status}`;
                
                // Special handling for decommissioned/unavailable models
                if (errorMessage.includes('decommissioned') || 
                    errorMessage.includes('no longer supported') ||
                    errorMessage.includes('not found') ||
                    errorMessage.includes('does not exist') ||
                    (response.status === 400 && errorMessage.includes('model')) ||
                    response.status === 404) {
                    throw new Error(`MODEL_NOT_FOUND: ${errorMessage}`);
                }
                
                throw new Error(`Groq API error: ${errorMessage}`);
            }

            const data = await response.json();
            
            console.log(`📥 Groq API response status: ${response.status}`);
            console.log(`📥 Groq response structure:`, data);
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from Groq API');
            }

            const comment = data.choices[0].message.content.trim();
            
            if (!comment) {
                throw new Error('Groq returned empty response');
            }
            
            // Check comment quality
            if (comment.length < 15 || comment.split(/\s+/).length < 5) {
                throw new Error('Generated comment is too short or low quality');
            }

            return comment;

        } catch (error) {
            console.error('Error calling Groq API:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Cannot connect to Groq API. Check your internet connection.');
            }
            
            throw error;
        }
    }

    async saveWorkingModel(workingModel) {
        try {
            await chrome.storage.sync.set({ groqModel: workingModel });
            console.log(`💾 Saved working Groq model: ${workingModel}`);
        } catch (error) {
            console.error('Error saving working model:', error);
        }
    }

    async testConnection(settings) {
        try {
            const response = await this.generateComment(
                'Тестовый пост для проверки подключения', 
                settings
            );
            return { success: true, message: 'Groq подключение успешно', testComment: response };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Google Gemini Provider
class GeminiProvider {
    constructor() {
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    }

    async generateComment(postText, settings) {
        const { geminiApiKey, geminiModel, geminiCustomModel, aiPrompt } = settings;
        
        if (!geminiApiKey) {
            throw new Error('Gemini API Key is not set in extension settings.');
        }

        if (!geminiModel) {
            throw new Error('No model specified for Gemini.');
        }

        // Get actual model name (handle custom model)
        let actualModel = geminiModel;
        if (geminiModel === 'custom') {
            actualModel = geminiCustomModel?.trim();
            if (!actualModel) {
                throw new Error('Custom Gemini model name is not specified.');
            }
        }

        // Define fallback models (don't use fallback for custom models)
        const fallbackModels = geminiModel === 'custom' ? [] : ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-lite'];
        const modelsToTry = [actualModel, ...fallbackModels].filter((m, i, arr) => arr.indexOf(m) === i);

        let lastError = null;

        for (const currentModel of modelsToTry) {
            try {
                const result = await this.makeRequest(postText, { ...settings, geminiModel: currentModel }, aiPrompt);
                
                // If we used a fallback model, save it to storage
                if (currentModel !== actualModel) {
                    console.log(`🔄 Switched from ${actualModel} to ${currentModel} due to model availability`);
                    await this.saveWorkingModel(currentModel);
                }
                
                return result;
            } catch (error) {
                console.error(`❌ Model ${currentModel} failed:`, error.message);
                
                // Don't try fallbacks for API key errors
                if (error.message.includes('API key') || error.message.includes('unauthorized')) {
                    throw error;
                }
                
                lastError = error;
                
                // Check if this is a model not found error
                if (!error.message.startsWith('MODEL_NOT_FOUND:')) {
                    throw error; // For non-model errors, don't try fallbacks
                }
                
                continue; // Try next model
            }
        }

        // If all models failed, throw the last error
        throw lastError || new Error('All Gemini models are unavailable');
    }

    async makeRequest(postText, settings, aiPrompt) {
        const { geminiApiKey, geminiModel } = settings;
        
        // ALWAYS use the user's custom prompt
        if (!aiPrompt || aiPrompt.trim().length === 0) {
            throw new Error('AI prompt is not configured. Please set a prompt in settings.');
        }
        const prompt = aiPrompt.replace(/{POST_TEXT}/g, postText);
        console.log(`📝 Using user's custom prompt: "${prompt.substring(0, 200)}..."`);
        
        console.log(`🔗 Making Gemini request to model: ${geminiModel}`);
        
        const url = `${this.baseUrl}/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                maxOutputTokens: 300,
                temperature: 0.8,
                topP: 1.0,
                topK: 40
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
                errorMessage.includes('model') && response.status === 400) {
                throw new Error(`MODEL_NOT_FOUND: Model ${settings.geminiModel} not found or unavailable`);
            }
            
            throw new Error(`Gemini API error: ${errorMessage}`);
        }

        const data = await response.json();
        
        console.log(`📥 Gemini API response status: ${response.status}`);
        console.log(`📥 Gemini response structure:`, data);
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('❌ Gemini response structure:', data);
            throw new Error('Invalid response format from Gemini API');
        }

        const content = data.candidates[0].content;
        if (!content.parts || !content.parts[0]) {
            throw new Error('Invalid response format from Gemini API');
        }

        const comment = content.parts[0].text.trim();
        
        // Check comment quality
        if (comment.length < 15 || comment.split(/\s+/).length < 5) {
            throw new Error('Generated comment is too short or low quality');
        }
        
        return comment;
    }

    async saveWorkingModel(workingModel) {
        try {
            await chrome.storage.sync.set({ geminiModel: workingModel });
            console.log(`💾 Saved working Gemini model: ${workingModel}`);
        } catch (error) {
            console.error('Error saving working Gemini model:', error);
        }
    }

    async testConnection(apiKey, model = 'gemini-2.5-flash') {
        try {
            const testPrompt = 'Напиши краткий дружелюбный комментарий';
            const settings = { 
                geminiApiKey: apiKey, 
                geminiModel: model,
                aiPrompt: testPrompt
            };
            
            const response = await this.makeRequest('Тестовый пост о природе', settings, testPrompt);
            return { success: true, message: 'Gemini подключение успешно', testComment: response };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AICommentGenerator, OpenAIProvider, OpenRouterProvider, GroqProvider, GeminiProvider };
}