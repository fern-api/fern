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
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
    ]),
);
