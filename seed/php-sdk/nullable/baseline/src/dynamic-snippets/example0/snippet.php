<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullable\Requests\GetUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullable->getUsers(
    new GetUsersRequest([
        'usernames' => [
            'usernames',
        ],
        'avatar' => 'avatar',
        'activated' => [
            true,
        ],
        'tags' => [
            'tags',
        ],
        'extra' => true,
    ]),
);
