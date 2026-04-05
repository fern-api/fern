<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\TestGetRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->testGet(
    'region',
    new TestGetRequest([
        'limit' => '100',
    ]),
);
