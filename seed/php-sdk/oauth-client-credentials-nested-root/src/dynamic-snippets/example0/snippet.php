<?php

namespace Example;

use Seed\SeedClient;
use Seed\Auth\Requests\GetTokenRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->auth->getToken(
    new GetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
        'audience' => 'https://api.example.com',
        'grantType' => 'client_credentials',
        'scope' => 'scope',
    ]),
);
