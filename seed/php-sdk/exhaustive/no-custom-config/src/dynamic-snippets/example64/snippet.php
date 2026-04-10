<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsParams\Requests\EndpointsParamsGetWithQueryRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsParams->endpointsParamsGetWithQuery(
    new EndpointsParamsGetWithQueryRequest([
        'query' => 'query',
        'number' => 1,
    ]),
);
