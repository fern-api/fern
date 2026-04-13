<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithCursorPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithcursorpagination(
    new UsersListWithCursorPaginationRequest([]),
);
