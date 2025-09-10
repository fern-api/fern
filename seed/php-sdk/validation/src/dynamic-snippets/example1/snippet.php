<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\GetRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->get(
    new GetRequest([
        'decimal' => 2.2,
        'even' => 100,
        'name' => 'fern',
    ]),
);
