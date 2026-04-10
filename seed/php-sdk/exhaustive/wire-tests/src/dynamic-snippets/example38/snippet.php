<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesNestedObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsObject->endpointsObjectGetAndReturnNestedWithOptionalField(
    new TypesNestedObjectWithOptionalField([]),
);
