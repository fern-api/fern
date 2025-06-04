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
    new SearchUsersRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'limit' => 1,
    ]),
);
