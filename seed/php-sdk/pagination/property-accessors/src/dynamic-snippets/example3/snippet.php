<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsers\InlineUsers\Requests\ListUsersBodyCursorPaginationRequest;
use Seed\InlineUsers\InlineUsers\Types\WithCursor;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsers->inlineUsers->listWithBodyCursorPagination(
    new ListUsersBodyCursorPaginationRequest([
        'pagination' => new WithCursor([
            'cursor' => 'cursor',
        ]),
    ]),
);
