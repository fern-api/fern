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
$client->endpoints->object->getAndReturnWithOptionalField(
    new ObjectWithOptionalField([
        'string' => 'test',
        'integer' => 21991583578,
        'long' => 9223372036854776000,
        'double' => 3.14,
        'bool' => true,
    ]),
);
