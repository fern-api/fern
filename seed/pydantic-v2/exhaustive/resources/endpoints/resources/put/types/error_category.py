from enum import Enum

class ErrorCategory(Enum):
    ApiError = "API_ERROR"
    AuthenticationError = "AUTHENTICATION_ERROR"
    InvalidRequestError = "INVALID_REQUEST_ERROR"

