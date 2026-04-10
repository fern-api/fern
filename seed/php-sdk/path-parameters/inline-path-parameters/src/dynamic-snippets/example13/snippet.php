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
    new UserSearchUsersRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'limit' => 1,
    ]),
);
