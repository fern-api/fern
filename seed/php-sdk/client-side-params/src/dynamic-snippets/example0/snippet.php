<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceListResourcesRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listresources(
    new ServiceListResourcesRequest([
        'page' => 1,
        'perPage' => 1,
        'sort' => 'sort',
        'order' => 'order',
        'includeTotals' => true,
    ]),
);
