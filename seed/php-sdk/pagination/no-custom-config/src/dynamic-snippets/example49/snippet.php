<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListUsernamesRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listusernames(
    new UsersListUsernamesRequest([
        'startingAfter' => 'starting_after',
    ]),
);
