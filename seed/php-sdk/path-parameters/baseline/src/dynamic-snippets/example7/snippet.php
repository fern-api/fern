<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getUserMetadata(
    'tenant_id',
    'user_id',
    1,
);
