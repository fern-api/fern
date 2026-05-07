<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\GetWithPathAndQueryParamsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->params->getWithPathAndQuery(
    'param',
    new GetWithPathAndQueryParamsRequest([
        'query' => 'query',
    ]),
);
