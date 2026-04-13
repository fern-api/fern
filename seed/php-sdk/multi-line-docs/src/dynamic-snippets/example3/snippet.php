<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserCreateUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createuser(
    new UserCreateUserRequest([
        'name' => 'name',
        'age' => 1,
    ]),
);
