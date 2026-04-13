<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithMixedTypeCursorPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithmixedtypecursorpagination(
    new UsersListWithMixedTypeCursorPaginationRequest([
        'cursor' => 'cursor',
    ]),
);
