<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest;
use Seed\Types\InlineUsersOrder;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithDoubleOffsetPagination(
    new InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest([
        'page' => 1.1,
        'perPage' => 1.1,
        'order' => InlineUsersOrder::Asc->value,
        'startingAfter' => 'starting_after',
    ]),
);
