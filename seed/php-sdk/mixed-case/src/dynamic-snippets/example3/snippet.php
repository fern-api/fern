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
        'pageLimit' => 1,
        'beforeDate' => '2023-01-15',
    ]),
);
