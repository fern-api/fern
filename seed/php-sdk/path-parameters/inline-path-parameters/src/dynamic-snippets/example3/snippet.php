<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\GetUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getUser(
    new GetUsersRequest([
        'userId' => 'user_id',
        'tenantId' => 'tenant_id',
    ]),
);
