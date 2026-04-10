<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesObjectWithRequiredField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsHttpMethods->endpointsHttpMethodsTestPost(
    new TypesObjectWithRequiredField([
        'string' => 'string',
    ]),
);
