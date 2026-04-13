<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithBodyCursorPaginationRequest;
use Seed\Types\WithCursor;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithbodycursorpagination(
    new UsersListWithBodyCursorPaginationRequest([
        'pagination' => new WithCursor([
            'cursor' => 'cursor',
        ]),
    ]),
);
