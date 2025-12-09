<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListWithGlobalConfigRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithGlobalConfig(
    new ListWithGlobalConfigRequest([
        'offset' => 1,
    ]),
);
