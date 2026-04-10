<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersCursorPaginationRequest;
use Seed\Users\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
        'page' => 1,
        'perPage' => 1,
        'order' => Order::Asc->value,
        'startingAfter' => 'starting_after',
    ]),
);
