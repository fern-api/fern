<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsernamesWithOptionalResponseRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listUsernamesWithOptionalResponse(
    new ListUsernamesWithOptionalResponseRequest([
        'startingAfter' => 'starting_after',
    ]),
);
