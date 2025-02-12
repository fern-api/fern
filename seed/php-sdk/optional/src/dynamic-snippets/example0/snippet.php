<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->optional->sendOptionalBody(
    [
        'string' => [
            'key' => "value",
        ],
    ],
);
