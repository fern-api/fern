<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\CreateRequest;
use Seed\Types\Shape;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->create(
    new CreateRequest([
        'decimal' => 2.2,
        'even' => 100,
        'name' => 'fern',
        'shape' => Shape::Square->value,
    ]),
);
