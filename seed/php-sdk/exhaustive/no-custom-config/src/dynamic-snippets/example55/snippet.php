<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesObjectWithUnknownField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnWithUnknownField(
    new TypesObjectWithUnknownField([
        'unknown' => [
            'key' => "value",
        ],
    ]),
);
