<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Types\CreateUserRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->createUser(
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
