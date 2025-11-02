"""
Browser Profile Management

Manages GoLogin profile fetching, caching, and validation.
"""

import os
import logging
import json
from typing import Optional, Dict, List
from pathlib import Path
import requests


class BrowserProfileManager:
    """
    Manages GoLogin browser profiles.
    
    Provides profile lookup by name, caching, and validation.
    """
    
    GOLOGIN_API_BASE = "https://api.gologin.com"
    PROFILES_ENDPOINT = "/browser/v2"
    CACHE_FILE = ".gologin_profiles_cache.json"
    
    def __init__(self, gologin_token: Optional[str] = None, cache_dir: Optional[str] = None):
        """
        Initialize Profile Manager.
        
        Args:
            gologin_token: GoLogin API token (defaults to GOLOGIN_TOKEN env var)
            cache_dir: Directory for cache file (defaults to project root)
        """
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Get GoLogin token
        self.gologin_token = gologin_token or os.getenv('GOLOGIN_TOKEN')
        if not self.gologin_token:
            raise ValueError("GOLOGIN_TOKEN must be provided as parameter or environment variable")
        
        # Set cache directory
        if cache_dir:
            self.cache_dir = Path(cache_dir)
        else:
            # Default to project root (go up from shared/)
            self.cache_dir = Path(__file__).parent.parent.parent
        
        self.cache_file = self.cache_dir / self.CACHE_FILE
        self.logger.info(f"Profile cache location: {self.cache_file}")
        
        # In-memory cache
        self._profiles_cache: Optional[List[Dict]] = None
    
    def get_profile_id_by_name(self, profile_name: str, use_cache: bool = True) -> Optional[str]:
        """
        Get GoLogin profile ID by profile name.
        
        Args:
            profile_name: Profile name to search for
            use_cache: Use cached profiles if available
            
        Returns:
            Profile ID or None if not found
        """
        self.logger.info(f"Looking up profile: {profile_name}")
        
        # Get all profiles
        profiles = self.get_all_profiles(use_cache=use_cache)
        if not profiles:
            self.logger.error("No profiles found")
            return None
        
        # Search for profile by name
        for profile in profiles:
            if profile.get('name') == profile_name:
                profile_id = profile.get('id')
                self.logger.info(f"Found profile '{profile_name}' -> ID: {profile_id}")
                return profile_id
        
        self.logger.warning(f"Profile '{profile_name}' not found")
        return None
    
    def get_profile_ids_by_names(self, profile_names: List[str], use_cache: bool = True) -> Dict[str, Optional[str]]:
        """
        Get multiple profile IDs by names.
        
        Args:
            profile_names: List of profile names
            use_cache: Use cached profiles if available
            
        Returns:
            Dictionary mapping profile names to IDs (None if not found)
        """
        self.logger.info(f"Looking up {len(profile_names)} profiles")
        
        profiles = self.get_all_profiles(use_cache=use_cache)
        if not profiles:
            return {name: None for name in profile_names}
        
        # Create name-to-id mapping
        profile_map = {profile['name']: profile['id'] for profile in profiles}
        
        # Map requested names to IDs
        result = {}
        for name in profile_names:
            profile_id = profile_map.get(name)
            result[name] = profile_id
            if profile_id:
                self.logger.info(f"Found profile '{name}' -> ID: {profile_id}")
            else:
                self.logger.warning(f"Profile '{name}' not found")
        
        return result
    
    def get_all_profiles(self, use_cache: bool = True) -> List[Dict]:
        """
        Fetch all GoLogin profiles.
        
        Args:
            use_cache: Use cached data if available
            
        Returns:
            List of profile dictionaries
        """
        # Check in-memory cache
        if use_cache and self._profiles_cache is not None:
            self.logger.debug("Using in-memory profile cache")
            return self._profiles_cache
        
        # Check file cache
        if use_cache and self.cache_file.exists():
            try:
                with open(self.cache_file, 'r') as f:
                    cached_data = json.load(f)
                    self._profiles_cache = cached_data
                    self.logger.info(f"Loaded {len(cached_data)} profiles from cache")
                    return cached_data
            except Exception as e:
                self.logger.warning(f"Failed to load cache: {e}")
        
        # Fetch from API
        profiles = self._fetch_profiles_from_api()
        
        # Cache the results
        if profiles:
            self._profiles_cache = profiles
            self._save_cache(profiles)
        
        return profiles
    
    def _fetch_profiles_from_api(self) -> List[Dict]:
        """
        Fetch profiles from GoLogin API.
        
        Returns:
            List of profile dictionaries
        """
        try:
            self.logger.info("Fetching profiles from GoLogin API...")
            
            all_profiles = []
            page = 1
            
            while True:
                url = f"{self.GOLOGIN_API_BASE}{self.PROFILES_ENDPOINT}"
                headers = {
                    "Authorization": f"Bearer {self.gologin_token}"
                }
                params = {
                    'page': page,
                    'sorterField': 'createdAt',
                    'sorterOrder': 'descend'
                }
                
                response = requests.get(url, headers=headers, params=params, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                profiles_batch = data.get('profiles', [])
                
                if not profiles_batch:
                    break
                
                all_profiles.extend(profiles_batch)
                
                # If we got fewer than 30 profiles, we've reached the last page
                if len(profiles_batch) < 30:
                    break
                
                page += 1
            
            self.logger.info(f"Fetched {len(all_profiles)} profiles from API")
            return all_profiles
        
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to fetch profiles from API: {e}")
            return []
        
        except Exception as e:
            self.logger.error(f"Unexpected error fetching profiles: {e}")
            return []
    
    def _save_cache(self, profiles: List[Dict]):
        """
        Save profiles to cache file.
        
        Args:
            profiles: List of profiles to cache
        """
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(profiles, f, indent=2)
            self.logger.debug(f"Saved {len(profiles)} profiles to cache")
        
        except Exception as e:
            self.logger.warning(f"Failed to save cache: {e}")
    
    def clear_cache(self):
        """Clear cached profiles."""
        self._profiles_cache = None
        
        if self.cache_file.exists():
            try:
                self.cache_file.unlink()
                self.logger.info("Profile cache cleared")
            except Exception as e:
                self.logger.warning(f"Failed to clear cache file: {e}")
    
    def validate_profile_exists(self, profile_name: str) -> bool:
        """
        Check if a profile exists.
        
        Args:
            profile_name: Profile name to validate
            
        Returns:
            True if profile exists, False otherwise
        """
        profile_id = self.get_profile_id_by_name(profile_name)
        return profile_id is not None
    
    def list_profile_names(self) -> List[str]:
        """
        Get list of all available profile names.
        
        Returns:
            List of profile names
        """
        profiles = self.get_all_profiles()
        return [profile.get('name', '') for profile in profiles if profile.get('name')]

