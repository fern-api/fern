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
    new UpdateUserRequest([]),
);
