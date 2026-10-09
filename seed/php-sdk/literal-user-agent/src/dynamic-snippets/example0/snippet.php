<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    userAgent: 'my-sdk',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->ping();
