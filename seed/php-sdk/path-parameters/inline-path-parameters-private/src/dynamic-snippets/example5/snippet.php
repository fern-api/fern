<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UpdateUserRequest;
use Seed\User\Types\User;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->updateUser(
    'tenant_id',
    'user_id',
    new UpdateUserRequest([
        'body' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
    ]),
);
