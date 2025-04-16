<?php

namespace Example;

use Seed\SeedClient;
use Seed\Union\Types\Shape;
use Seed\Union\Types\Circle;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->union->update(
    Shape::circle('id', new Circle([
        'radius' => 1.1,
    ])),
);
