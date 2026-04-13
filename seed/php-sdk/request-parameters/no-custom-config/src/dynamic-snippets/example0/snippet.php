<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserCreateUsernameRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createusername(
    new UserCreateUsernameRequest([
        'tags' => [
            'tags',
        ],
        'username' => 'username',
        'password' => 'password',
        'name' => 'name',
    ]),
);
