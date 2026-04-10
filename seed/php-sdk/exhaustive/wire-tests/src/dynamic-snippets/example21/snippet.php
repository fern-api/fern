<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesWeatherReport;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsEnum->endpointsEnumGetAndReturnEnum(
    TypesWeatherReport::Sunny->value,
);
