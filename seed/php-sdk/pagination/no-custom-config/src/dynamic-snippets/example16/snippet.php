<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersTopLevelBodyCursorPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithTopLevelBodyCursorPagination(
    new ListUsersTopLevelBodyCursorPaginationRequest([
        'cursor' => 'initial_cursor',
        'filter' => 'active',
    ]),
);
