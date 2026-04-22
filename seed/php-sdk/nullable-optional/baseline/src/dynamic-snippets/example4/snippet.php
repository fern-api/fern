<?php

namespace Example;

use Seed\SeedClient;
use Seed\NullableOptional\Requests\SearchUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableOptional->searchUsers(
    new SearchUsersRequest([
        'query' => 'query',
        'department' => 'department',
        'role' => 'role',
        'isActive' => true,
    ]),
);
