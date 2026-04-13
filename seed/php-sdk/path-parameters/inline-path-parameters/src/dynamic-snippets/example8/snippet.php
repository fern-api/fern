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
    new UserUpdateUserRequest([
        'tenantId' => 'tenant_id',
        'userId' => 'user_id',
        'body' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
            ],
        ]),
    ]),
);
