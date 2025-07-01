<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\CreateUsernameRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createUsername(
    new CreateUsernameRequest([
        'username' => 'username',
        'password' => 'password',
        'name' => 'test',
    ]),
);
