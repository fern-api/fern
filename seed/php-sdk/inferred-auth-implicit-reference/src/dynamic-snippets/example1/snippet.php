<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\GetTokenRequest;
use Seed\Auth\Types\GetTokenRequestAudience;
use Seed\Auth\Types\GetTokenRequestGrantType;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->gettokenwithclientcredentials(
    new GetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => GetTokenRequestAudience::HttpsApiExampleCom->value,
        'grantType' => GetTokenRequestGrantType::ClientCredentials->value,
        'scope' => 'scope',
    ]),
);
