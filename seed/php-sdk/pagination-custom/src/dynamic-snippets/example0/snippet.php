<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListWithCustomPagerRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithCustomPager(
    new ListWithCustomPagerRequest([
        'limit' => 1,
        'startingAfter' => 'starting_after',
    ]),
);
