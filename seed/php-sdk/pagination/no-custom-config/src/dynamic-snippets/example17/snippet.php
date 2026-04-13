<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest;
use Seed\Types\InlineUsersOrder;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
    new InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest([
        'page' => 1,
        'limit' => 1,
        'order' => InlineUsersOrder::Asc->value,
    ]),
);
