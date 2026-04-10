<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithOffsetStepPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithOffsetStepPagination(
    new InlineUsersInlineUsersListWithOffsetStepPaginationRequest([]),
);
