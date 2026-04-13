<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\UsersListUsernamesWithOptionalResponseRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listusernameswithoptionalresponse(
    new UsersListUsernamesWithOptionalResponseRequest([
        'startingAfter' => 'starting_after',
    ]),
);
