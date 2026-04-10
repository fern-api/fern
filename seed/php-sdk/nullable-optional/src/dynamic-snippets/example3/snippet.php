<?php

namespace Example;

use Seed\SeedClient;
use Seed\NullableOptional\Requests\ListUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableOptional->listUsers(
    new ListUsersRequest([
        'limit' => 1,
        'offset' => 1,
        'includeDeleted' => true,
        'sortBy' => 'sortBy',
    ]),
);
