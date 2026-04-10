<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesObjectWithMapOfMap;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsObject->endpointsObjectGetAndReturnWithMapOfMap(
    new TypesObjectWithMapOfMap([
        'map' => [
            'key' => [
                'key' => 'value',
            ],
        ],
    ]),
);
