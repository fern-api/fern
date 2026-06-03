<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\PlantPost;
use Seed\Types\PlantPostWateringFrequency;
use Seed\Types\PlantPostSunExposure;
use DateTime;

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
        'commonName' => 'commonName',
        'wateringFrequency' => PlantPostWateringFrequency::Daily->value,
        'sunExposure' => PlantPostSunExposure::Full->value,
        'plantedAt' => new DateTime('2023-01-15'),
        'soilType' => 'soilType',
    ]),
);
