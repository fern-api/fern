<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceGetClientRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getclient(
    'clientId',
    new ServiceGetClientRequest([]),
);
