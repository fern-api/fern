<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithOffsetPaginationRequest;
use Seed\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithoffsetpagination(
    new UsersListWithOffsetPaginationRequest([
        'page' => 1,
        'perPage' => 1,
        'order' => Order::Asc->value,
        'startingAfter' => 'starting_after',
    ]),
);
