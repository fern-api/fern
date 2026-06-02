<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Types\User;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createUser(
    new User([
        'name' => 'name',
        'tags' => [
            'tags',
            'tags',
        ],
    ]),
    'tenant_id',
);
