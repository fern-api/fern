<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListWithOffsetPaginationHasNextPageRequest;
use Seed\Users\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithOffsetPaginationHasNextPage(
    new ListWithOffsetPaginationHasNextPageRequest([
        'page' => 1,
        'limit' => 1,
        'order' => Order::Asc->value,
    ]),
);
