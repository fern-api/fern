<?php

namespace Seed\Endpoints\Put\Types;

enum ErrorCode
 : string {
    case InternalServerError = "INTERNAL_SERVER_ERROR";
    case Unauthorized = "UNAUTHORIZED";
    case Forbidden = "FORBIDDEN";
    case BadRequest = "BAD_REQUEST";
    case Conflict = "CONFLICT";
    case Gone = "GONE";
    case UnprocessableEntity = "UNPROCESSABLE_ENTITY";
    case NotImplemented = "NOT_IMPLEMENTED";
    case BadGateway = "BAD_GATEWAY";
    case ServiceUnavailable = "SERVICE_UNAVAILABLE";
    case Unknown = "Unknown";
}
