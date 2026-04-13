<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceListConnectionsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listconnections(
    new ServiceListConnectionsRequest([]),
);
