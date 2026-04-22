<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ListUsersRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listUsers(
    new ListUsersRequest([
        'page' => 1,
        'perPage' => 1,
        'includeTotals' => true,
        'sort' => 'sort',
        'connection' => 'connection',
        'q' => 'q',
        'searchEngine' => 'search_engine',
        'fields' => 'fields',
    ]),
);
