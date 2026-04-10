<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsParams\Requests\EndpointsParamsGetWithInlinePathAndQueryRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsParams->endpointsParamsGetWithInlinePathAndQuery(
    'param',
    new EndpointsParamsGetWithInlinePathAndQueryRequest([
        'query' => 'query',
    ]),
);
