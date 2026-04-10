<?php

namespace Example;

use Seed\SeedClient;
use Seed\Optional\Requests\DeployParams;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->optional->sendoptionalnullablewithalloptionalproperties(
    'actionId',
    'id',
    new DeployParams([
        'updateDraft' => true,
    ]),
);
