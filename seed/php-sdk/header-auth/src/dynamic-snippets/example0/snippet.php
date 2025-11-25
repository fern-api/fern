<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    headerTokenAuth: '<value>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getWithBearerToken();
