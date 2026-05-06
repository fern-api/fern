<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\GetTokenRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->getToken(
    new GetTokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
    ]),
);
