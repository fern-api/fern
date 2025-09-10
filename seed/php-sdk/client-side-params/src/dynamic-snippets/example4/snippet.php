<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\GetUserRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getUserById(
    'userId',
    new GetUserRequest([
        'fields' => 'fields',
        'includeFields' => true,
    ]),
);
