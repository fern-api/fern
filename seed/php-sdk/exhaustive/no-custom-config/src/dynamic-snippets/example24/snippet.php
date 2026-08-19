<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithDocumentedUnknownType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnWithDocumentedUnknownType(
    new ObjectWithDocumentedUnknownType([
        'documentedUnknownType' => [
            'key' => "value",
        ],
    ]),
);
