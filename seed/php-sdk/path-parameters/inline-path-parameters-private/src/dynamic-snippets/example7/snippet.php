<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserGetUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getuser(
    new UserGetUserRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
    ]),
);
