<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithMapOfMap;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnWithMapOfMap(
    new ObjectWithMapOfMap([
        'map' => [
            'map' => [
                'map' => 'map',
            ],
        ],
    ]),
);
