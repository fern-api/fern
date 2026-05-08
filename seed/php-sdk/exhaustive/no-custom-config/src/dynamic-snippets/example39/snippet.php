<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\HttpMethods\Requests\TestPatchHttpMethodsRequest;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->httpMethods->testPatch(
    'id',
    new TestPatchHttpMethodsRequest([
        'body' => new TypesObjectWithOptionalField([]),
    ]),
);
