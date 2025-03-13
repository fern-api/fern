<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    apiKey: '<value>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getWithApiKey();
