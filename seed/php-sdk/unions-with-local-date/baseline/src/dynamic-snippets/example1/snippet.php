<?php

namespace Example;

use Seed\SeedClient;
use Seed\Bigunion\Types\BigUnion;
use DateTime;
use Seed\Bigunion\Types\NormalSweet;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->bigunion->update(
    BigUnion::normalSweet('id', new DateTime('2024-01-15T09:30:00Z'), new DateTime('2024-01-15T09:30:00Z'), new NormalSweet([
        'value' => 'value',
    ])),
);
