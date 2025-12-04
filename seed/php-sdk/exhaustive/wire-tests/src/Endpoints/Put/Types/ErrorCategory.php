<?php

namespace Seed\Endpoints\Put\Types;

enum ErrorCategory
 : string {
    case ApiError = "API_ERROR";
    case AuthenticationError = "AUTHENTICATION_ERROR";
    case InvalidRequestError = "INVALID_REQUEST_ERROR";
}
