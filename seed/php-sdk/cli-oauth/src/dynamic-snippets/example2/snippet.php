<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\RefreshTokenAuthRequest;
use Seed\Auth\Types\RefreshTokenAuthRequestGrantType;

$client = new SeedClient(
    clientId: '<clientId>',
    clientSecret: '<clientSecret>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->refreshToken(
    new RefreshTokenAuthRequest([
        'refreshToken' => 'refresh_token',
        'grantType' => RefreshTokenAuthRequestGrantType::RefreshToken->value,
    ]),
);
