<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithCursorPaginationRequest;
use Seed\Types\InlineUsersOrder;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithCursorPagination(
    new InlineUsersInlineUsersListWithCursorPaginationRequest([
        'page' => 1,
        'perPage' => 1,
        'order' => InlineUsersOrder::Asc->value,
        'startingAfter' => 'starting_after',
    ]),
);
