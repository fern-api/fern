<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithUnknownField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnWithUnknownField(
    new ObjectWithUnknownField([
        'unknown' => [
            'key' => "value",
        ],
    ]),
);
