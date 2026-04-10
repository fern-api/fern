<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\SearchResourcesRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->searchResources(
    new SearchResourcesRequest([
        'limit' => 1,
        'offset' => 1,
        'query' => 'query',
        'filters' => [
            'filters' => [
                'key' => "value",
            ],
        ],
    ]),
);
