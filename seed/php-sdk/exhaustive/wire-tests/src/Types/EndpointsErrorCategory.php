<?php

namespace Seed\Types;

enum EndpointsErrorCategory: string
{
    case ApiError = "API_ERROR";
    case AuthenticationError = "AUTHENTICATION_ERROR";
    case InvalidRequestError = "INVALID_REQUEST_ERROR";
}
