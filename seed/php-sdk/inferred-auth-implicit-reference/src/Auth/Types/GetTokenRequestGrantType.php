<?php

namespace Seed\Auth\Types;

enum GetTokenRequestGrantType: string
{
    case ClientCredentials = "client_credentials";
}
