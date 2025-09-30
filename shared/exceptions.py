"""
Shared exception classes for all microservices.
"""


class AutomationServiceException(Exception):
    """Base exception for all automation services."""

    def __init__(self, message: str, error_code: str = "INTERNAL_ERROR"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


class GoLoginException(AutomationServiceException):
    """Exception related to GoLogin operations."""

    def __init__(self, message: str, error_code: str = "GOLOGIN_ERROR"):
        super().__init__(message, error_code)


class BrowserAutomationException(AutomationServiceException):
    """Exception related to browser automation."""

    def __init__(self, message: str, error_code: str = "BROWSER_ERROR"):
        super().__init__(message, error_code)


class CloudflareException(AutomationServiceException):
    """Exception related to Cloudflare challenges."""

    def __init__(self, message: str, error_code: str = "CLOUDFLARE_ERROR"):
        super().__init__(message, error_code)


class ValidationException(AutomationServiceException):
    """Exception for validation errors."""

    def __init__(self, message: str, error_code: str = "VALIDATION_ERROR"):
        super().__init__(message, error_code)


class ConfigurationException(AutomationServiceException):
    """Exception for configuration errors."""

    def __init__(self, message: str, error_code: str = "CONFIG_ERROR"):
        super().__init__(message, error_code)
