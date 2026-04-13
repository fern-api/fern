<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithOffsetStepPaginationRequest;
use Seed\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithoffsetsteppagination(
    new UsersListWithOffsetStepPaginationRequest([
        'page' => 1,
        'limit' => 1,
        'order' => Order::Asc->value,
    ]),
);
