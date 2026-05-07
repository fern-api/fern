<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\HttpMethods\Requests\HttpMethodsTestPatchHttpMethodsRequest;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->httpMethods->httpMethodsTestPatch(
    'id',
    new HttpMethodsTestPatchHttpMethodsRequest([
        'body' => new TypesObjectWithOptionalField([]),
    ]),
);
