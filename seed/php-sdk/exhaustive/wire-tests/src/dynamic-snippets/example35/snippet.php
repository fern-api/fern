<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\HttpMethods\Requests\TestPutHttpMethodsRequest;
use Seed\Types\TypesObjectWithRequiredField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->httpMethods->testPut(
    'id',
    new TestPutHttpMethodsRequest([
        'body' => new TypesObjectWithRequiredField([
            'string' => 'string',
        ]),
    ]),
);
