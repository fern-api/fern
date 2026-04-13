<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\NullableOptionalSearchUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->searchusers(
    new NullableOptionalSearchUsersRequest([
        'query' => 'query',
        'department' => 'department',
        'role' => 'role',
        'isActive' => true,
    ]),
);
