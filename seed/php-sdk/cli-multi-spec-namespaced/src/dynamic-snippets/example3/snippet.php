<?php

namespace Example;

use Seed\SeedClient;
use Seed\V2\Requests\ListUsersRequest;

$client = new SeedClient(
    apiKey: '<X-Api-Key>',
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->v2->listUsers(
    new ListUsersRequest([
        'pageSize' => 1,
    ]),
);
