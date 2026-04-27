<?php

namespace Example;

use Seed\SeedClient;
use Seed\Union\Types\NamedMetadata;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->union->getWithBaseProperties(
    new NamedMetadata([
        'name' => 'name',
        'value' => [
            'value' => [
                'key' => "value",
            ],
        ],
    ]),
);
