<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\SearchUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->searchUsers(
    'tenant_id',
    'user_id',
    new SearchUsersRequest([
        'limit' => 1,
    ]),
);
