<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithBodyOffsetPaginationRequest;
use Seed\Types\WithPage;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithbodyoffsetpagination(
    new UsersListWithBodyOffsetPaginationRequest([
        'pagination' => new WithPage([
            'page' => 1,
        ]),
    ]),
);
