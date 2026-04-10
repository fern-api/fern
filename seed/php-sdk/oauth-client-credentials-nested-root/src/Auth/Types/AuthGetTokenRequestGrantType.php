<?php

namespace Seed\Auth\Types;

enum AuthGetTokenRequestGrantType: string
{
    case ClientCredentials = "client_credentials";
}
