<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\GetUserSpecificsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getUserSpecifics(
    new GetUserSpecificsRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'version' => 1,
        'thought' => 'thought',
    ]),
);
