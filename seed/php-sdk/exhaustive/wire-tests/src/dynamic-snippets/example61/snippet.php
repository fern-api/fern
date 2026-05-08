<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Pagination\Requests\ListItemsPaginationRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->pagination->listItems(
    new ListItemsPaginationRequest([]),
);
