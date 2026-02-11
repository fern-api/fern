<?php

namespace Example;

use Seed\SeedClient;
use Seed\ReqWithHeaders\Requests\ReqWithHeaders;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->reqWithHeaders->getWithCustomHeader(
    new ReqWithHeaders([
        'xTestServiceHeader' => 'X-TEST-SERVICE-HEADER',
        'xTestEndpointHeader' => 'X-TEST-ENDPOINT-HEADER',
        'body' => 'string',
    ]),
);
