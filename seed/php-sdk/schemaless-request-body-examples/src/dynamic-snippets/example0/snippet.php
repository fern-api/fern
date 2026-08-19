<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createPlant(
    [
        'name' => "Venus Flytrap",
        'species' => "Dionaea muscipula",
        'care' => [
            'light' => "full sun",
            'water' => "distilled only",
            'humidity' => "high",
        ],
        'tags' => [
            "carnivorous",
            "tropical",
        ],
    ],
);
