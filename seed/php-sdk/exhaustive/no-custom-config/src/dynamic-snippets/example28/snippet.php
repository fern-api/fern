<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsHttpMethods\Requests\EndpointsHttpMethodsTestPatchRequest;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsHttpMethods->endpointsHttpMethodsTestPatch(
    'id',
    new EndpointsHttpMethodsTestPatchRequest([
        'body' => new TypesObjectWithOptionalField([]),
    ]),
);
