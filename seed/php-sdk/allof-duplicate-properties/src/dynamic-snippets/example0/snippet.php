<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\CreatePlantOrderRequest;
use Seed\Types\PlantOrder;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createPlantOrder(
    'plantId',
    new CreatePlantOrderRequest([
        'body' => new PlantOrder([
            'orderId' => 'orderId',
            'amount' => 1.1,
            'currency' => 'currency',
            'plantName' => 'plantName',
        ]),
    ]),
);
