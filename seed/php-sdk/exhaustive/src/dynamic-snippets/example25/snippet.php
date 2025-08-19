<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->testIntegerOverflowEdgeCases(
    new ObjectWithOptionalField([
        'string' => 'large-negative',
        'integer' => -1000000000000,
        'double' => -1000000000000,
        'bool' => true,
    ]),
);
