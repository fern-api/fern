<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\GetTokenRequest;
use Seed\Auth\Types\GrantType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->getToken(
    new GetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => 'https://api.example.com',
        'grantType' => GrantType::AuthorizationCode->value,
        'scope' => 'scope',
    ]),
);
