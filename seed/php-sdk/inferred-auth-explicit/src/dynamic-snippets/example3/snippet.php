<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\AuthRefreshTokenRequest;
use Seed\Auth\Types\AuthRefreshTokenRequestAudience;
use Seed\Auth\Types\AuthRefreshTokenRequestGrantType;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->refreshtoken(
    new AuthRefreshTokenRequest([
        'apiKey' => 'apiKey',
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'refreshToken' => 'refresh_token',
        'audience' => AuthRefreshTokenRequestAudience::HttpsApiExampleCom->value,
        'grantType' => AuthRefreshTokenRequestGrantType::RefreshToken->value,
        'scope' => 'scope',
    ]),
);
