<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersBodyOffsetPaginationRequest;
use Seed\Users\Types\WithPage;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithBodyOffsetPagination(
    new ListUsersBodyOffsetPaginationRequest([
        'pagination' => new WithPage([
            'page' => 1,
        ]),
    ]),
);
