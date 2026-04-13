<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListWithExtendedResultsAndOptionalData(
    new InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest([]),
);
