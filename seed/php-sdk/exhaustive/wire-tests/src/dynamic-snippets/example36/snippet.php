<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\GetWithMultipleQuery;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->params->getWithAllowMultipleQuery(
    new GetWithMultipleQuery([
        'query' => [
            'query',
        ],
        'number' => [
            1,
        ],
    ]),
);
