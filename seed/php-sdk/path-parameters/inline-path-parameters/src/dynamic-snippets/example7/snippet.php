<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\GetUserMetadataRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getUserMetadata(
    new GetUserMetadataRequest([
        'userId' => 'user_id',
        'version' => 1,
        'tenantId' => 'tenant_id',
    ]),
);
