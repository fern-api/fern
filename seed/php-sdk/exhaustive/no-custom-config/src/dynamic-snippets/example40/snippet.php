<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\ModifyResourceAtInlinedPath;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->params->modifyWithInlinePath(
    'param',
    new ModifyResourceAtInlinedPath([
        'body' => 'string',
    ]),
);
