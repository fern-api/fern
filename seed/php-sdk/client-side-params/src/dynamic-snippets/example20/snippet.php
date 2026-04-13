<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceListClientsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listclients(
    new ServiceListClientsRequest([]),
);
