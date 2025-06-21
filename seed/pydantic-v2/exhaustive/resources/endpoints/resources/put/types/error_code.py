from typing import TypeVar
from enum import Enum

class ErrorCode(Enum):
    InternalServerError = "INTERNAL_SERVER_ERROR"
    Unauthorized = "UNAUTHORIZED"
    Forbidden = "FORBIDDEN"
    BadRequest = "BAD_REQUEST"
    Conflict = "CONFLICT"
    Gone = "GONE"
    UnprocessableEntity = "UNPROCESSABLE_ENTITY"
    NotImplemented = "NOT_IMPLEMENTED"
    BadGateway = "BAD_GATEWAY"
    ServiceUnavailable = "SERVICE_UNAVAILABLE"
    Unknown = "Unknown"
def visit(
    self,
    InternalServerError = "INTERNAL_SERVER_ERROR": typing.Callable[[], T_Result],
    Unauthorized = "UNAUTHORIZED": typing.Callable[[], T_Result],
    Forbidden = "FORBIDDEN": typing.Callable[[], T_Result],
    BadRequest = "BAD_REQUEST": typing.Callable[[], T_Result],
    Conflict = "CONFLICT": typing.Callable[[], T_Result],
    Gone = "GONE": typing.Callable[[], T_Result],
    UnprocessableEntity = "UNPROCESSABLE_ENTITY": typing.Callable[[], T_Result],
    NotImplemented = "NOT_IMPLEMENTED": typing.Callable[[], T_Result],
    BadGateway = "BAD_GATEWAY": typing.Callable[[], T_Result],
    ServiceUnavailable = "SERVICE_UNAVAILABLE": typing.Callable[[], T_Result],
    Unknown = "Unknown": typing.Callable[[], T_Result]
    ) -> T_Result:
    if self is ErrorCode.InternalServerError = "INTERNAL_SERVER_ERROR":
        return InternalServerError = "INTERNAL_SERVER_ERROR"()
    if self is ErrorCode.Unauthorized = "UNAUTHORIZED":
        return Unauthorized = "UNAUTHORIZED"()
    if self is ErrorCode.Forbidden = "FORBIDDEN":
        return Forbidden = "FORBIDDEN"()
    if self is ErrorCode.BadRequest = "BAD_REQUEST":
        return BadRequest = "BAD_REQUEST"()
    if self is ErrorCode.Conflict = "CONFLICT":
        return Conflict = "CONFLICT"()
    if self is ErrorCode.Gone = "GONE":
        return Gone = "GONE"()
    if self is ErrorCode.UnprocessableEntity = "UNPROCESSABLE_ENTITY":
        return UnprocessableEntity = "UNPROCESSABLE_ENTITY"()
    if self is ErrorCode.NotImplemented = "NOT_IMPLEMENTED":
        return NotImplemented = "NOT_IMPLEMENTED"()
    if self is ErrorCode.BadGateway = "BAD_GATEWAY":
        return BadGateway = "BAD_GATEWAY"()
    if self is ErrorCode.ServiceUnavailable = "SERVICE_UNAVAILABLE":
        return ServiceUnavailable = "SERVICE_UNAVAILABLE"()
    if self is ErrorCode.Unknown = "Unknown":
        return Unknown = "Unknown"()

