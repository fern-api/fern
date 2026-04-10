<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsParams\Requests\EndpointsParamsGetWithPathAndQueryRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsParams->endpointsParamsGetWithPathAndQuery(
    'param',
    new EndpointsParamsGetWithPathAndQueryRequest([
        'query' => 'query',
    ]),
);
