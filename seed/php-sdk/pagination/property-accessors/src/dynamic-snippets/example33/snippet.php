<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithTopLevelBodyCursorPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithtoplevelbodycursorpagination(
    new UsersListWithTopLevelBodyCursorPaginationRequest([
        'cursor' => 'cursor',
        'filter' => 'filter',
    ]),
);
