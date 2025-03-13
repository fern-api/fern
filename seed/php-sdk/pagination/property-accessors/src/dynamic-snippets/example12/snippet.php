<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersCursorPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithCursorPagination(
    new ListUsersCursorPaginationRequest([
        'startingAfter' => 'starting_after',
    ]),
);
