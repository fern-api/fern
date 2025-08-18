<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ListClientsRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->listClients(
    new ListClientsRequest([
        'fields' => 'fields',
        'includeFields' => true,
        'page' => 1,
        'perPage' => 1,
        'includeTotals' => true,
        'isGlobal' => true,
        'isFirstParty' => true,
        'appType' => [
            'app_type',
            'app_type',
        ],
    ]),
);
