<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserGetUserMetadataRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getusermetadata(
    new UserGetUserMetadataRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'version' => 1,
    ]),
);
