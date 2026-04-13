<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserCreateUserRequest;
use Seed\Types\User;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createuser(
    new UserCreateUserRequest([
        'tenantId' => 'tenant_id',
        'body' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
            ],
        ]),
    ]),
);
