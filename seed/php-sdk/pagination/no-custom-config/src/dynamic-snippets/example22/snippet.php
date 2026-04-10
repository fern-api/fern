<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlineUsersInlineUsers\Requests\InlineUsersInlineUsersListUsernamesRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlineUsersInlineUsers->inlineUsersInlineUsersListUsernames(
    new InlineUsersInlineUsersListUsernamesRequest([]),
);
