<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\PlantPost;
use Seed\Types\PlantPostSunExposure;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createPlant(
    new PlantPost([
        'species' => 'species',
        'family' => 'family',
        'genus' => 'genus',
        'sunExposure' => PlantPostSunExposure::Full->value,
    ]),
);
