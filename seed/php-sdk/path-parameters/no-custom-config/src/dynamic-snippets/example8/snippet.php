<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getUserSpecifics(
    'user_id',
    1,
    'thought',
    'tenant_id',
);
