<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsers\InlineUsers\Requests\ListUsersDoubleOffsetPaginationRequest;
use Seed\InlineUsers\InlineUsers\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsers->inlineUsers->listWithDoubleOffsetPagination(
    new ListUsersDoubleOffsetPaginationRequest([
        'page' => 1.1,
        'perPage' => 1.1,
        'order' => Order::Asc->value,
        'startingAfter' => 'starting_after',
    ]),
);
