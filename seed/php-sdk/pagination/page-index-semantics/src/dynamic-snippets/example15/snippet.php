<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersBodyCursorPaginationRequest;
use Seed\Users\Types\WithCursor;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithBodyCursorPagination(
    new ListUsersBodyCursorPaginationRequest([
        'pagination' => new WithCursor([
            'cursor' => 'cursor',
        ]),
    ]),
);
