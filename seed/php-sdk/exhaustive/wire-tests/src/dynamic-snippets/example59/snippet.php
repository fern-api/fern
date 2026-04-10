<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsParams\Requests\EndpointsParamsModifyWithPathRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsParams->endpointsParamsModifyWithPath(
    'param',
    new EndpointsParamsModifyWithPathRequest([
        'body' => 'string',
    ]),
);
