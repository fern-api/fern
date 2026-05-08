<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\GetWithAllowMultipleQueryParamsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->params->getWithAllowMultipleQuery(
    new GetWithAllowMultipleQueryParamsRequest([
        'query' => [
            'query',
        ],
        'number' => [
            1,
        ],
    ]),
);
