<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithCustomPagerRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithcustompager(
    new UsersListWithCustomPagerRequest([
        'limit' => 1,
        'startingAfter' => 'starting_after',
    ]),
);
