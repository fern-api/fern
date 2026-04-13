<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\BigUnionZero;
use Seed\Types\BigUnionZeroType;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->bigunion->update(
    new BigUnionZero([
        'type' => BigUnionZeroType::NormalSweet->value,
        'value' => 'value',
    ]),
);
