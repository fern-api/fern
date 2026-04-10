<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsParams\Requests\EndpointsParamsModifyWithInlinePathRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsParams->endpointsParamsModifyWithInlinePath(
    'param',
    new EndpointsParamsModifyWithInlinePathRequest([
        'body' => 'string',
    ]),
);
