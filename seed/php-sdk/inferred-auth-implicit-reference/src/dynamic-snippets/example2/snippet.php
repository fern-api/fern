<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\RefreshTokenRequest;
use Seed\Auth\Types\RefreshTokenRequestAudience;
use Seed\Auth\Types\RefreshTokenRequestGrantType;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->refreshtoken(
    new RefreshTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'refreshToken' => 'refresh_token',
        'audience' => RefreshTokenRequestAudience::HttpsApiExampleCom->value,
        'grantType' => RefreshTokenRequestGrantType::RefreshToken->value,
    ]),
);
