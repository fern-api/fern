<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithExtendedResultsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithExtendedResults(
    new InlineUsersInlineUsersListWithExtendedResultsRequest([]),
);
