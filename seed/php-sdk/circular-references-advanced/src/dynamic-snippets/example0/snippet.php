<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\ObjectJsonSchemaPropertyInput;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->testEndpoint(
    new ObjectJsonSchemaPropertyInput([]),
);
