<?php

namespace Seed\Auth\Types;

enum AuthGetTokenWithClientCredentialsRequestGrantType: string
{
    case ClientCredentials = "client_credentials";
}
