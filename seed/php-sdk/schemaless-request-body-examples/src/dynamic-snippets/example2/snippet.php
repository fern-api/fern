<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\UpdatePlantRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->updatePlant(
    'plantId',
    new UpdatePlantRequest([
        'body' => [
            'name' => "Updated Venus Flytrap",
            'care' => [
                'light' => "partial shade",
            ],
        ],
    ]),
);
