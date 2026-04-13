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
        'connection' => 'connection',
    ]),
);
