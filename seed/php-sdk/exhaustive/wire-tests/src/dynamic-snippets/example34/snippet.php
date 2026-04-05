<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\GetWithInlinePathAndQuery;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->params->getWithInlinePathAndQuery(
    'param',
    new GetWithInlinePathAndQuery([
        'query' => 'query',
    ]),
);
