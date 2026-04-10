<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesObjectWithDocumentedUnknownType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsObject->endpointsObjectGetAndReturnWithDocumentedUnknownType(
    new TypesObjectWithDocumentedUnknownType([
        'documentedUnknownType' => [
            'key' => "value",
        ],
    ]),
);
