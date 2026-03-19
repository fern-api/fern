<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TokenRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->getToken(
    new TokenRequest([
        'clientId' => 'client_id',
        'clientSecret' => 'client_secret',
    ]),
);
