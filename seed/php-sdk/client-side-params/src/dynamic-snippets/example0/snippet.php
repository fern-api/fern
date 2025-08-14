<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ListResourcesRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listResources(
    new ListResourcesRequest([
        'page' => 1,
        'perPage' => 1,
        'sort' => 'created_at',
        'order' => 'desc',
        'includeTotals' => true,
        'fields' => 'fields',
        'search' => 'search',
    ]),
);
