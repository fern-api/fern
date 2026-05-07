<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesNestedObjectWithRequiredField;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnNestedWithRequiredFieldAsList(
    [
        new TypesNestedObjectWithRequiredField([
            'string' => 'string',
            'nestedObject' => new TypesObjectWithOptionalField([]),
        ]),
    ],
);
