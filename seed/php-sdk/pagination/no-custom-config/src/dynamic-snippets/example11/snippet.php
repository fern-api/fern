<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsers\InlineUsers\Requests\ListUsersCursorPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsers->inlineUsers->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
        'startingAfter' => 'starting_after',
    ]),
);
