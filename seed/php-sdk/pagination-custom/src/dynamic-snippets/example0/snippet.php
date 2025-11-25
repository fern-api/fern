<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsernamesRequestCustom;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listUsernamesCustom(
    new ListUsernamesRequestCustom([
        'startingAfter' => 'starting_after',
    ]),
);
