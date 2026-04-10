<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\RefreshTokenRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->refreshtoken(
    new RefreshTokenRequest([
        'ttl' => 1,
    ]),
);
