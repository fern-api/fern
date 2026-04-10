<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithOffsetPaginationHasNextPageRequest;
use Seed\Types\Order;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithoffsetpaginationhasnextpage(
    new UsersListWithOffsetPaginationHasNextPageRequest([
        'page' => 1,
        'limit' => 1,
        'order' => Order::Asc->value,
    ]),
);
