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
$client->endpoints->object->getAndReturnWithDocumentedUnknownType(
    new TypesObjectWithDocumentedUnknownType([
        'documentedUnknownType' => [
            'key' => "value",
        ],
    ]),
);
