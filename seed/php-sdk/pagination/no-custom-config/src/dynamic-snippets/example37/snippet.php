<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithDoubleOffsetPaginationRequest;
use Seed\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithdoubleoffsetpagination(
    new UsersListWithDoubleOffsetPaginationRequest([
        'page' => 1.1,
        'perPage' => 1.1,
        'order' => Order::Asc->value,
        'startingAfter' => 'starting_after',
    ]),
);
