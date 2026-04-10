<?php

namespace Example;

use Seed\SeedClient;
use DateTime;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsPrimitive->endpointsPrimitiveGetAndReturnDatetime(
    new DateTime('2024-01-15T09:30:00Z'),
);
