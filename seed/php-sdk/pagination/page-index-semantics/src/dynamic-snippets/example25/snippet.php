<?php

namespace Example;

use Seed\SeedClient;
use Seed\Users\Requests\ListUsersExtendedRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->users->listWithExtendedResults(
    new ListUsersExtendedRequest([
        'cursor' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    ]),
);
