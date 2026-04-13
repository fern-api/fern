<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\UpdateUserRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->updateuser(
    'userId',
    new UpdateUserRequest([
        'email' => 'email',
        'emailVerified' => true,
        'username' => 'username',
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
        'password' => 'password',
        'blocked' => true,
    ]),
);
