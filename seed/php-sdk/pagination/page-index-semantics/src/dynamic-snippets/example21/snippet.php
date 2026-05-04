<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersOffsetStepPaginationRequest;
use Seed\Users\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithOffsetStepPagination(
    new ListUsersOffsetStepPaginationRequest([
        'page' => 1,
        'limit' => 1,
        'order' => Order::Asc->value,
    ]),
);
