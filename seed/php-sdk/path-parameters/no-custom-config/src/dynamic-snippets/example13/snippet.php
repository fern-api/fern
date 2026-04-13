<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserSearchUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->searchusers(
    'tenant_id',
    'user_id',
    new UserSearchUsersRequest([
        'limit' => 1,
    ]),
);
