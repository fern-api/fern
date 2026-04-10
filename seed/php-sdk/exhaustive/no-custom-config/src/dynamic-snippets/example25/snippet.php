<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsHttpMethods\Requests\EndpointsHttpMethodsTestPutRequest;
use Seed\Types\TypesObjectWithRequiredField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsHttpMethods->endpointsHttpMethodsTestPut(
    'id',
    new EndpointsHttpMethodsTestPutRequest([
        'body' => new TypesObjectWithRequiredField([
            'string' => 'string',
        ]),
    ]),
);
