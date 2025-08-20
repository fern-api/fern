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
        'string' => 'just-under-boundary',
        'integer' => -2147483649,
        'double' => -2,
        'bool' => true,
    ]),
);
