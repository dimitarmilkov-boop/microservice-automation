"""
AI Comment Generator
Refactored to match 'threads AI comm (1)/ai-generator.js' logic.
Supports OpenAI and Groq.
"""
import os
import re
import requests
import logging
import random

logger = logging.getLogger(__name__)

class AIProvider:
    def generate(self, prompt: str, model: str) -> str:
        raise NotImplementedError

class OpenAIProvider(AIProvider):
    def __init__(self, key):
        self.key = key
        self.url = "https://api.openai.com/v1/chat/completions"

    def generate(self, prompt: str, model: str) -> str:
        headers = {"Authorization": f"Bearer {self.key}", "Content-Type": "application/json"}
        data = {
            "model": model or "gpt-4-turbo",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 100,
            "temperature": 0.7
        }
        resp = requests.post(self.url, headers=headers, json=data)
        resp.raise_for_status()
        return resp.json()['choices'][0]['message']['content']

class GroqProvider(AIProvider):
    def __init__(self, key):
        self.key = key
        self.url = "https://api.groq.com/openai/v1/chat/completions"

    def generate(self, prompt: str, model: str) -> str:
        headers = {"Authorization": f"Bearer {self.key}", "Content-Type": "application/json"}
        data = {
            "model": model or "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 100,
            "temperature": 0.7
        }
        resp = requests.post(self.url, headers=headers, json=data)
        resp.raise_for_status()
        return resp.json()['choices'][0]['message']['content']

class AICommentGenerator:
    def __init__(self):
        self.providers = {}
        if os.getenv("OPENAI_API_KEY"):
            self.providers["openai"] = OpenAIProvider(os.getenv("OPENAI_API_KEY"))
        if os.getenv("GROQ_API_KEY"):
            self.providers["groq"] = GroqProvider(os.getenv("GROQ_API_KEY"))
        
        self.manual_comments = [
            "Great post!", "Interesting perspective!", "Thanks for sharing.",
            "Love this!", "So true.", "Totally agree."
        ]

    def clean_comment(self, text: str) -> str:
        # Remove quotes
        text = text.strip().strip('"').strip("'")
        # Remove prefixes like "Comment:"
        text = re.sub(r'^(Comment:|Reply:|Answer:)\s*', '', text, flags=re.IGNORECASE)
        return text.strip()

    def generate_comment(self, post_text: str, provider_name: str = "openai", model: str = None, prompt_template: str = None) -> str:
        if not post_text:
            return ""
            
        # Fallback to manual if no provider configured or key missing
        if provider_name not in self.providers:
            logger.warning(f"Provider {provider_name} not available (key missing?). Using fallback.")
            return random.choice(self.manual_comments)

        # Prepare prompt
        if not prompt_template:
            prompt_template = "Write a short, casual comment for: {POST_TEXT}"
        
        final_prompt = prompt_template.replace("{POST_TEXT}", post_text)
        
        try:
            raw_comment = self.providers[provider_name].generate(final_prompt, model)
            return self.clean_comment(raw_comment)
        except Exception as e:
            logger.error(f"AI Generation failed: {e}")
            return random.choice(self.manual_comments)
