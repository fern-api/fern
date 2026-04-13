<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithBodyOffsetPaginationRequest;
use Seed\Types\InlineUsersWithPage;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithBodyOffsetPagination(
    new InlineUsersInlineUsersListWithBodyOffsetPaginationRequest([
        'pagination' => new InlineUsersWithPage([
            'page' => 1,
        ]),
    ]),
);
