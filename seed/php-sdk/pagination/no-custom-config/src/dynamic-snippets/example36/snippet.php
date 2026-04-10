<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithDoubleOffsetPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithdoubleoffsetpagination(
    new UsersListWithDoubleOffsetPaginationRequest([]),
);
