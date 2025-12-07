"""
AI Comment Generator
Ported from 'threads AI comm (1)/ai-generator.js'
Supports OpenAI and Groq (fastest).
"""
import os
import requests
import logging

logger = logging.getLogger(__name__)

class AICommentGenerator:
    def __init__(self, openai_key=None, groq_key=None):
        self.openai_key = openai_key or os.getenv("OPENAI_API_KEY")
        self.groq_key = groq_key or os.getenv("GROQ_API_KEY")
        
    def generate_comment(self, post_text: str, provider="groq", model="llama-3.1-8b-instant", prompt_template=None) -> str:
        """
        Generate a relevant comment for a Threads post.
        """
        if not post_text:
            return ""

        # Default Prompt if none provided
        if not prompt_template:
            prompt_template = "Write a short, friendly, and engaging comment for this Threads post: '{POST_TEXT}'. Keep it under 20 words. No hashtags."
            
        final_prompt = prompt_template.replace("{POST_TEXT}", post_text)
        
        try:
            if provider == "groq":
                return self._generate_groq(final_prompt, model)
            elif provider == "openai":
                return self._generate_openai(final_prompt, model)
            else:
                logger.error(f"Unknown AI provider: {provider}")
                return ""
        except Exception as e:
            logger.error(f"AI Generation failed: {e}")
            return ""

    def _generate_groq(self, prompt: str, model: str) -> str:
        if not self.groq_key:
            raise ValueError("Groq API Key missing")
            
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 60
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        return result['choices'][0]['message']['content'].strip().strip('"')

    def _generate_openai(self, prompt: str, model: str) -> str:
        if not self.openai_key:
            raise ValueError("OpenAI API Key missing")
            
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model, # e.g. gpt-3.5-turbo
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 60
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        return result['choices'][0]['message']['content'].strip().strip('"')








