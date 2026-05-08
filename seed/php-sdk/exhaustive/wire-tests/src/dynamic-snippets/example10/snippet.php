<?php

namespace Example;

use Seed\SeedClient;
use Seed\ReqWithHeaders\Requests\GetWithCustomHeaderReqWithHeadersRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->reqWithHeaders->getWithCustomHeader(
    new GetWithCustomHeaderReqWithHeadersRequest([
        'testEndpointHeader' => 'testEndpointHeader',
        'body' => 'string',
    ]),
);
