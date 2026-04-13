<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceSearchResourcesRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->searchresources(
    new ServiceSearchResourcesRequest([
        'limit' => 1,
        'offset' => 1,
    ]),
);
