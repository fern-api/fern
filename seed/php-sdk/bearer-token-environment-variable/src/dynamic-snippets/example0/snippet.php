<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    version: '1.0.0',
    apiKey: 'YOUR_API_KEY',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getWithBearerToken();
