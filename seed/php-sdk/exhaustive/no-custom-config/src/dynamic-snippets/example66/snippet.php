<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsParams\Requests\EndpointsParamsGetWithAllowMultipleQueryRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsParams->endpointsParamsGetWithAllowMultipleQuery(
    new EndpointsParamsGetWithAllowMultipleQueryRequest([
        'query' => [
            'query',
        ],
        'number' => [
            1,
        ],
    ]),
);
