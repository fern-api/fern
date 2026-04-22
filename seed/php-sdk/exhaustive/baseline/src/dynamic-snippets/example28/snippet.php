<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithRequiredNestedObject;
use Seed\Types\Object\Types\NestedObjectWithRequiredField;
use Seed\Types\Object\Types\ObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnWithRequiredNestedObject(
    new ObjectWithRequiredNestedObject([
        'requiredString' => 'hello',
        'requiredObject' => new NestedObjectWithRequiredField([
            'string' => 'nested',
            'nestedObject' => new ObjectWithOptionalField([]),
        ]),
    ]),
);
