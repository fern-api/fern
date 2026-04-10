<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    apiKey: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getWithBearerToken();
