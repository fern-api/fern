<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithMixedRequiredAndOptionalFields;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnWithMixedRequiredAndOptionalFields(
    new ObjectWithMixedRequiredAndOptionalFields([
        'requiredString' => 'requiredString',
        'requiredInteger' => 1,
        'optionalString' => 'optionalString',
        'requiredLong' => 1000000,
    ]),
);
