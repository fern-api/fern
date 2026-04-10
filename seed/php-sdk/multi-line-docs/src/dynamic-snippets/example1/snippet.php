<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\CreateUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createUser(
    new CreateUserRequest([
        'name' => 'name',
        'age' => 1,
    ]),
);
