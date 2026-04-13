<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceListResourcesRequest;
use DateTime;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listresources(
    new ServiceListResourcesRequest([
        'pageLimit' => 1,
        'beforeDate' => new DateTime('2023-01-15'),
    ]),
);
