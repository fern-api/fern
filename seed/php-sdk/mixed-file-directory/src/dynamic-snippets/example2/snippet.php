<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\UserListRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->list(
    new UserListRequest([]),
);
