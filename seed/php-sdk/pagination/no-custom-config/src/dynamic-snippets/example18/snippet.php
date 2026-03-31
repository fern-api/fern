<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersOffsetPaginationRequest;
use Seed\Users\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithOffsetPagination(
    new ListUsersOffsetPaginationRequest([
        'page' => 1,
        'perPage' => 1,
        'order' => Order::Asc->value,
        'startingAfter' => 'starting_after',
    ]),
);
