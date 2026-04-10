<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithCursorPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithCursorPagination(
    new InlineUsersInlineUsersListWithCursorPaginationRequest([]),
);
