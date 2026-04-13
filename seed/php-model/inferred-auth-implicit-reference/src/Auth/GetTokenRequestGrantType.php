<?php

namespace Seed\Auth;

enum GetTokenRequestGrantType: string
{
    case ClientCredentials = "client_credentials";
}
