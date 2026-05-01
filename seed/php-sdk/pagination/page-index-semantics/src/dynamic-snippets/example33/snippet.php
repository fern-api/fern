<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersAliasedDataRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithAliasedData(
    new ListUsersAliasedDataRequest([
        'page' => 1,
        'perPage' => 1,
        'startingAfter' => 'starting_after',
    ]),
);
