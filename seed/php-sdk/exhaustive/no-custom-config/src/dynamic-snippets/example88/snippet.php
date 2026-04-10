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
$client->endpointsPrimitive->endpointsPrimitiveGetAndReturnDate(
    new DateTime('2023-01-15'),
);
