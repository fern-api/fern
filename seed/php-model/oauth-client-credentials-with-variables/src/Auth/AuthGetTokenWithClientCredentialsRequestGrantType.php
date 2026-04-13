<?php

namespace Seed\Auth;

enum AuthGetTokenWithClientCredentialsRequestGrantType: string
{
    case ClientCredentials = "client_credentials";
}
