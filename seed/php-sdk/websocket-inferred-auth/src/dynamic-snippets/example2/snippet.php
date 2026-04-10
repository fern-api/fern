<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\AuthRefreshTokenRequest;
use Seed\Auth\Types\AuthRefreshTokenRequestAudience;
use Seed\Auth\Types\AuthRefreshTokenRequestGrantType;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
        'apiKey' => '<X-Api-Key>',
    ],
);
$client->auth->refreshtoken(
    new AuthRefreshTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'refreshToken' => 'refresh_token',
        'audience' => AuthRefreshTokenRequestAudience::HttpsApiExampleCom->value,
        'grantType' => AuthRefreshTokenRequestGrantType::RefreshToken->value,
    ]),
);
