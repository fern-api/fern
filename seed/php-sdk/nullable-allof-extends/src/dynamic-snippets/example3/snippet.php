<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\RootObject;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createTest(
    new RootObject([
        'normalField' => 'normalField',
        'nullableField' => 'nullableField',
    ]),
);
