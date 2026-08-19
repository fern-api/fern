<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    headerTokenAuth: 'YOUR_HEADER_VALUE',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getWithBearerToken();
