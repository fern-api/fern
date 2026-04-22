<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ListResourcesRequest;
use DateTime;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listResources(
    new ListResourcesRequest([
        'pageLimit' => 10,
        'beforeDate' => new DateTime('2023-01-01'),
    ]),
);
