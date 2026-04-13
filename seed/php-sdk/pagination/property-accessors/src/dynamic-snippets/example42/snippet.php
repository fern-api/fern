<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithOffsetPaginationHasNextPageRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithoffsetpaginationhasnextpage(
    new UsersListWithOffsetPaginationHasNextPageRequest([]),
);
