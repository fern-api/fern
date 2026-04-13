<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceListUsersRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listusers(
    new ServiceListUsersRequest([
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
