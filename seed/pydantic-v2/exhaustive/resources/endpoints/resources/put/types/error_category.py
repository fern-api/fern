from typing import TypeVar
from enum import Enum

class ErrorCategory(Enum):
    ApiError = "API_ERROR"
    AuthenticationError = "AUTHENTICATION_ERROR"
    InvalidRequestError = "INVALID_REQUEST_ERROR"
def visit(
    self,
    ApiError = "API_ERROR": typing.Callable[[], T_Result],
    AuthenticationError = "AUTHENTICATION_ERROR": typing.Callable[[], T_Result],
    InvalidRequestError = "INVALID_REQUEST_ERROR": typing.Callable[[], T_Result]
    ) -> T_Result:
    if self is ErrorCategory.ApiError = "API_ERROR":
        return ApiError = "API_ERROR"()
    if self is ErrorCategory.AuthenticationError = "AUTHENTICATION_ERROR":
        return AuthenticationError = "AUTHENTICATION_ERROR"()
    if self is ErrorCategory.InvalidRequestError = "INVALID_REQUEST_ERROR":
        return InvalidRequestError = "INVALID_REQUEST_ERROR"()

