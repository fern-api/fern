<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Types\GetTokenRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->getTokenWithClientCredentials(
    new GetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => 'https://api.example.com',
        'grantType' => 'client_credentials',
        'scope' => 'scope',
    ]),
);
