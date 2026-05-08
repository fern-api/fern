<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Object\Requests\GetAndReturnNestedWithRequiredFieldObjectRequest;
use Seed\Types\TypesNestedObjectWithRequiredField;
use Seed\Types\TypesObjectWithOptionalField;
use DateTime;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnNestedWithRequiredField(
    'stringValue',
    new GetAndReturnNestedWithRequiredFieldObjectRequest([
        'body' => new TypesNestedObjectWithRequiredField([
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
