<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsernamesRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listUsernames(
    new ListUsernamesRequest([
        'startingAfter' => 'starting_after',
    ]),
);
