<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsObject\Requests\EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest;
use Seed\Types\TypesNestedObjectWithRequiredField;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsObject->endpointsObjectGetAndReturnNestedWithRequiredField(
    'string',
    new EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest([
        'body' => new TypesNestedObjectWithRequiredField([
            'string' => 'string',
            'nestedObject' => new TypesObjectWithOptionalField([]),
        ]),
    ]),
);
