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
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'refreshToken' => 'refresh_token',
        'audience' => 'https://api.example.com',
        'grantType' => 'refresh_token',
        'scope' => 'scope',
    ]),
);
