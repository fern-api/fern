<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\ShapeZero;
use Seed\Types\ShapeZeroType;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->union->update(
    new ShapeZero([
        'type' => ShapeZeroType::Circle->value,
        'radius' => 1.1,
    ]),
);
