<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsers\InlineUsers\Requests\ListUsersExtendedRequestForOptionalData;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsers->inlineUsers->listWithExtendedResultsAndOptionalData(
    new ListUsersExtendedRequestForOptionalData([
        'cursor' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    ]),
);
