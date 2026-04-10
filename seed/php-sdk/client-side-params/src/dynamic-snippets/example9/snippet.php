<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\CreateUserRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->createuser(
    new CreateUserRequest([
        'email' => 'email',
        'emailVerified' => true,
        'username' => 'username',
        'password' => 'password',
        'phoneNumber' => 'phone_number',
        'phoneVerified' => true,
        'userMetadata' => [
            'user_metadata' => [
                'key' => "value",
            ],
        ],
        'appMetadata' => [
            'app_metadata' => [
                'key' => "value",
            ],
        ],
        'connection' => 'connection',
    ]),
);
