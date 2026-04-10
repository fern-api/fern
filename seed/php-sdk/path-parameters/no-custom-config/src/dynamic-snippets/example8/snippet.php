<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getUserSpecifics(
    'tenant_id',
    'user_id',
    1,
    'thought',
);
