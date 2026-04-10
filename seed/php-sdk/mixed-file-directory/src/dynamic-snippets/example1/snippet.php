<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\ListUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->list(
    new ListUsersRequest([
        'limit' => 1,
    ]),
);
