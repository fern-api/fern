<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\AuthGetTokenWithClientCredentialsRequest;
use Seed\Auth\Types\AuthGetTokenWithClientCredentialsRequestAudience;
use Seed\Auth\Types\AuthGetTokenWithClientCredentialsRequestGrantType;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
        'apiKey' => '<X-Api-Key>',
    ],
);
$client->auth->gettokenwithclientcredentials(
    new AuthGetTokenWithClientCredentialsRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => AuthGetTokenWithClientCredentialsRequestAudience::HttpsApiExampleCom->value,
        'grantType' => AuthGetTokenWithClientCredentialsRequestGrantType::ClientCredentials->value,
        'scope' => 'scope',
    ]),
);
