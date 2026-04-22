<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsers\InlineUsers\Requests\ListUsersMixedTypeCursorPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsers->inlineUsers->listWithMixedTypeCursorPagination(
    new ListUsersMixedTypeCursorPaginationRequest([
        'cursor' => 'cursor',
    ]),
);
