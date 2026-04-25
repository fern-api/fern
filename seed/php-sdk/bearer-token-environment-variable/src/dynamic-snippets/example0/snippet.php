<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    apiKey: 'YOUR_API_KEY',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getWithBearerToken();
