<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\AuthGetTokenRequest;
use Seed\Auth\Types\AuthGetTokenRequestAudience;
use Seed\Auth\Types\AuthGetTokenRequestGrantType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->gettoken(
    new AuthGetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => AuthGetTokenRequestAudience::HttpsApiExampleCom->value,
        'grantType' => AuthGetTokenRequestGrantType::ClientCredentials->value,
        'scope' => 'scope',
    ]),
);
