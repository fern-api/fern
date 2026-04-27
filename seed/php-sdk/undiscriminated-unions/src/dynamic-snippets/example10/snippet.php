<?php

namespace Example;

use Seed\SeedClient;
use Seed\Union\Types\LeafObjectA;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->union->aliasedObjectUnion(
    new LeafObjectA([
        'onlyInA' => 'onlyInA',
        'sharedNumber' => 1,
    ]),
);
