<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getuserspecifics(
    'tenant_id',
    'user_id',
    1,
    'thought',
);
