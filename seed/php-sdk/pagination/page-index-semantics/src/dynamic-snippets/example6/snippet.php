<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsers\InlineUsers\Requests\ListUsersBodyOffsetPaginationRequest;
use Seed\InlineUsers\InlineUsers\Types\WithPage;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsers->inlineUsers->listWithBodyOffsetPagination(
    new ListUsersBodyOffsetPaginationRequest([
        'pagination' => new WithPage([
            'page' => 1,
        ]),
    ]),
);
