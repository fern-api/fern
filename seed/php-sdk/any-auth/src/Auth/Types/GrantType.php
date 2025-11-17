<?php

namespace Seed\Auth\Types;

enum GrantType: string
{
    case AuthorizationCode = "authorization_code";
    case RefreshToken = "refresh_token";
    case ClientCredentials = "client_credentials";
}
