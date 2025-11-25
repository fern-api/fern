<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\RefreshTokenRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->refreshToken(
    new RefreshTokenRequest([
        'clientId' => 'my_oauth_app_123',
        'clientSecret' => 'sk_live_abcdef123456789',
        'refreshToken' => 'refresh_token',
        'audience' => 'https://api.example.com',
        'grantType' => 'refresh_token',
        'scope' => 'read:users',
    ]),
);
