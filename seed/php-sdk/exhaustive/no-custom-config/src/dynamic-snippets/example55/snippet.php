<?php

namespace Example;

use Seed\SeedClient;
use Seed\EndpointsPagination\Requests\EndpointsPaginationListItemsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsPagination->endpointsPaginationListItems(
    new EndpointsPaginationListItemsRequest([
        'cursor' => 'cursor',
        'limit' => 1,
    ]),
);
