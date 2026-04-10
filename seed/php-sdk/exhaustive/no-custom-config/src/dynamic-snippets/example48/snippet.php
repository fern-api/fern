<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesObjectWithMixedRequiredAndOptionalFields;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsObject->endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(
    new TypesObjectWithMixedRequiredAndOptionalFields([
        'requiredString' => 'requiredString',
        'requiredInteger' => 1,
        'requiredLong' => 1000000,
    ]),
);
