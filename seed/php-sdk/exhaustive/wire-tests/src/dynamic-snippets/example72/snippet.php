<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\GetWithQueryParamsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->params->getWithQuery(
    new GetWithQueryParamsRequest([
        'query' => 'query',
        'number' => 1,
    ]),
);
