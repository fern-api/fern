<?php

namespace Seed\Auth\Types;

enum GetTokenAuthRequestGrantType: string
{
    case ClientCredentials = "client_credentials";
}
