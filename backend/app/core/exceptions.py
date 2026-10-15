class ExitCapsuleException(Exception):
    """Base exception for Exit Capsule Generator"""
    pass

class PathSecurityError(ExitCapsuleException):
    """Raised when an unsafe path or directory traversal is detected"""
    pass

class CommandExecutionError(ExitCapsuleException):
    """Raised when a subprocess command fails or exceeds limits"""
    pass

class AIConfigurationError(ExitCapsuleException):
    """Raised when AI provider or model is not properly configured"""
    pass

class VerificationError(ExitCapsuleException):
    """Raised when an internal verification engine error occurs"""
    pass
