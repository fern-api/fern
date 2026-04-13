<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserGetUserSpecificsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getuserspecifics(
    new UserGetUserSpecificsRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'version' => 1,
        'thought' => 'thought',
    ]),
);
