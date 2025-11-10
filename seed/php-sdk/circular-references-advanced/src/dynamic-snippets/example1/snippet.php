<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\ObjectJsonSchemaPropertyInput;
use Seed\Types\LiteralJsonSchemaProperty;
use Seed\Types\LiteralJsonSchemaPropertyType;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->testEndpoint(
    new ObjectJsonSchemaPropertyInput([
        'type' => 'object',
        'required' => [
            'required',
            'required',
        ],
        'description' => 'description',
        'properties' => [
            'properties' => new LiteralJsonSchemaProperty([
                'type' => LiteralJsonSchemaPropertyType::String->value,
                'description' => 'description',
            ]),
        ],
    ]),
);
