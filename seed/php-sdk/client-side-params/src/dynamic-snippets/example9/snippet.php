<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\GetConnectionRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getConnection(
    'connectionId',
    new GetConnectionRequest([
        'fields' => 'fields',
    ]),
);
