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
        'string' => 'boundary-test',
        'integer' => 2147483647,
        'double' => 1.7976931348623157e+308,
        'bool' => true,
    ]),
);
