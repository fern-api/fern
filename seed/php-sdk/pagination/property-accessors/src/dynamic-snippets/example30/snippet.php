<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithBodyCursorPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithbodycursorpagination(
    new UsersListWithBodyCursorPaginationRequest([]),
);
