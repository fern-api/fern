<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithBodyCursorPaginationRequest;
use Seed\Types\InlineUsersWithCursor;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithBodyCursorPagination(
    new InlineUsersInlineUsersListWithBodyCursorPaginationRequest([
        'pagination' => new InlineUsersWithCursor([
            'cursor' => 'cursor',
        ]),
    ]),
);
