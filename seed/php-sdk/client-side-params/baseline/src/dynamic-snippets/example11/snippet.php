<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\GetClientRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getClient(
    'clientId',
    new GetClientRequest([
        'fields' => 'fields',
        'includeFields' => true,
    ]),
);
