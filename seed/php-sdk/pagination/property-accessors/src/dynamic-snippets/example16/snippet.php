<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
    new InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest([]),
);
