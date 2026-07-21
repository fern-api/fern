<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\GetTokenAuthRequest;
use Seed\Auth\Types\GetTokenAuthRequestGrantType;

$client = new SeedClient(
    clientId: '<clientId>',
    clientSecret: '<clientSecret>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->getToken(
    new GetTokenAuthRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'scopes' => 'scopes',
        'grantType' => GetTokenAuthRequestGrantType::ClientCredentials->value,
        'tenant' => 'tenant',
    ]),
);
