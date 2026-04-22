<?php

namespace Example;

use Seed\SeedClient;
use Seed\Union\Types\Request;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->union->call(
    new Request([
        'union' => [
            'union' => [
                'key' => "value",
            ],
        ],
    ]),
);
