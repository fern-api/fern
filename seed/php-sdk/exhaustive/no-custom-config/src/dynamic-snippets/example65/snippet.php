<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\ModifyWithPathParamsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->params->modifyWithPath(
    'param',
    new ModifyWithPathParamsRequest([
        'body' => 'string',
    ]),
);
