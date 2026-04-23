<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsers\InlineUsers\Requests\ListWithOffsetPaginationHasNextPageRequest;
use Seed\InlineUsers\InlineUsers\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsers->inlineUsers->listWithOffsetPaginationHasNextPage(
    new ListWithOffsetPaginationHasNextPageRequest([
        'page' => 1,
        'limit' => 1,
        'order' => Order::Asc->value,
    ]),
);
