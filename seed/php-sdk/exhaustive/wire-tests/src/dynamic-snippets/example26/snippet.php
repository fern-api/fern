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
        'requiredString' => 'hello',
        'requiredInteger' => 0,
        'optionalString' => 'world',
        'requiredLong' => 0,
    ]),
);
