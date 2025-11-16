<?php

namespace Example;

use Seed\SeedClient;
use Seed\Optional\Types\DeployParams;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->optional->sendOptionalNullableWithAllOptionalProperties(
    'actionId',
    'id',
    new DeployParams([
        'updateDraft' => true,
    ]),
);
