<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\BigEntity;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->createbigentity(
    new BigEntity([]),
);
