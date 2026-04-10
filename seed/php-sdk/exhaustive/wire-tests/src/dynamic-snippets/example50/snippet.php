<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesObjectWithRequiredNestedObject;
use Seed\Types\TypesNestedObjectWithRequiredField;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsObject->endpointsObjectGetAndReturnWithRequiredNestedObject(
    new TypesObjectWithRequiredNestedObject([
        'requiredString' => 'requiredString',
        'requiredObject' => new TypesNestedObjectWithRequiredField([
            'string' => 'string',
            'nestedObject' => new TypesObjectWithOptionalField([]),
        ]),
    ]),
);
