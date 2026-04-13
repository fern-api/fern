<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\CreateUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->createuser(
    new CreateUserRequest([
        'username' => 'username',
    ]),
);
