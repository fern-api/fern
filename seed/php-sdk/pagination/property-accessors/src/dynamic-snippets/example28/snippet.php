<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersOptionalDataRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithOptionalData(
    new ListUsersOptionalDataRequest([
        'page' => 1,
    ]),
);
