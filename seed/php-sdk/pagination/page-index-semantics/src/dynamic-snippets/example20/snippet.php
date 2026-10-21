<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersDoubleOffsetPaginationRequest;
use Seed\Users\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithDoubleOffsetPagination(
    new ListUsersDoubleOffsetPaginationRequest([
        'page' => 1.1,
        'perPage' => 1.1,
        'order' => Order::Asc->value,
        'startingAfter' => 'starting_after',
    ]),
);
