<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListWithAliasedDataRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listwithaliaseddata(
    new UsersListWithAliasedDataRequest([
        'page' => 1,
        'perPage' => 1,
        'startingAfter' => 'starting_after',
    ]),
);
