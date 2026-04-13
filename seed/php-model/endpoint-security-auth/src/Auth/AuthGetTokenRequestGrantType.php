<?php

namespace Seed\Auth;

enum AuthGetTokenRequestGrantType: string
{
    case ClientCredentials = "client_credentials";
}
