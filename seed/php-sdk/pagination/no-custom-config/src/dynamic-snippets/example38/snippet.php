<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithBodyOffsetPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithbodyoffsetpagination(
    new UsersListWithBodyOffsetPaginationRequest([]),
);
