<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\HttpMethods\Requests\HttpMethodsTestPutHttpMethodsRequest;
use Seed\Types\TypesObjectWithRequiredField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->httpMethods->httpMethodsTestPut(
    'id',
    new HttpMethodsTestPutHttpMethodsRequest([
        'body' => new TypesObjectWithRequiredField([
            'string' => 'string',
        ]),
    ]),
);
