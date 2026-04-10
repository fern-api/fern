<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesObjectWithRequiredNestedObject;
use Seed\Types\TypesNestedObjectWithRequiredField;
use Seed\Types\TypesObjectWithOptionalField;
use DateTime;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsObject->endpointsObjectGetAndReturnWithRequiredNestedObject(
    new TypesObjectWithRequiredNestedObject([
        'requiredString' => 'requiredString',
        'requiredObject' => new TypesNestedObjectWithRequiredField([
            'string' => 'string',
            'nestedObject' => new TypesObjectWithOptionalField([
                'string' => 'string',
                'integer' => 1,
                'long' => 1000000,
                'double' => 1.1,
                'bool' => true,
                'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                'date' => new DateTime('2023-01-15'),
                'uuid' => 'uuid',
                'base64' => 'base64',
                'list' => [
                    'list',
                    'list',
                ],
                'set' => [
                    'set',
                    'set',
                ],
                'map' => [
                    'map' => 'map',
                ],
                'bigint' => 1,
            ]),
        ]),
    ]),
);
