<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->primitive->getAndReturnBase64(
    'SGVsbG8gd29ybGQh',
);
