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

