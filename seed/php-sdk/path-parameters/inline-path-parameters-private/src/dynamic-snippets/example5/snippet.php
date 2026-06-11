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
    new UpdateUserRequest([
        'userId' => 'user_id',
        'tenantId' => 'tenant_id',
        'body' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
    ]),
);
