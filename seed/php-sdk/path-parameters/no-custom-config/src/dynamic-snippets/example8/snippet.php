<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserUpdateUserRequest;
use Seed\Types\User;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->updateuser(
    'tenant_id',
    'user_id',
    new UserUpdateUserRequest([
        'body' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
            ],
        ]),
    ]),
);
