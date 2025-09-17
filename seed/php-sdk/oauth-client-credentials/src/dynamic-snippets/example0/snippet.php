<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\GetTokenRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->getTokenWithClientCredentials(
    new GetTokenRequest([
        'clientId' => 'my_oauth_app_123',
        'clientSecret' => 'sk_live_abcdef123456789',
        'audience' => 'https://api.example.com',
        'grantType' => 'client_credentials',
        'scope' => 'read:users',
    ]),
);
