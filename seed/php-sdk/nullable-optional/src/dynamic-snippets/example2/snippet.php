<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\UpdateUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->updateuser(
    'userId',
    new UpdateUserRequest([]),
);
