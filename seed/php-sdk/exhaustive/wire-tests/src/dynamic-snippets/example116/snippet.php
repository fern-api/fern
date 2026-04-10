<?php

namespace Example;

use Seed\SeedClient;
use Seed\Reqwithheaders\Requests\ReqWithHeadersGetWithCustomHeaderRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->reqwithheaders->getwithcustomheader(
    new ReqWithHeadersGetWithCustomHeaderRequest([
        'testEndpointHeader' => 'testEndpointHeader',
        'body' => 'string',
    ]),
);
