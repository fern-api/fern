<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Object\Requests\GetAndReturnNestedWithRequiredFieldObjectRequest;
use Seed\Types\TypesNestedObjectWithRequiredField;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnNestedWithRequiredField(
    'string',
    new GetAndReturnNestedWithRequiredFieldObjectRequest([
        'body' => new TypesNestedObjectWithRequiredField([
            'string' => 'string',
            'nestedObject' => new TypesObjectWithOptionalField([]),
        ]),
    ]),
);
