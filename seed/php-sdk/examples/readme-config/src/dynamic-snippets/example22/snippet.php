<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Types\RefreshTokenRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->refreshToken(
    new RefreshTokenRequest([
        'ttl' => 1,
    ]),
);
