<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\ModifyWithInlinePathParamsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->params->modifyWithInlinePath(
    'param',
    new ModifyWithInlinePathParamsRequest([
        'body' => 'string',
    ]),
);
