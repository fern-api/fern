<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ListConnectionsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listConnections(
    new ListConnectionsRequest([
        'strategy' => 'strategy',
        'name' => 'name',
        'fields' => 'fields',
    ]),
);
