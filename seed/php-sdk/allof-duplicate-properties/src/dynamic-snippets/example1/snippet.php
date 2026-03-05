<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\CreatePlantOrderRequest;
use Seed\Types\PlantOrder;
use DateTime;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createPlantOrder(
    'plantId',
    new CreatePlantOrderRequest([
        'body' => new PlantOrder([
            'plantName' => 'plantName',
            'quantity' => 1,
            'orderId' => 'orderId',
            'amount' => 1.1,
            'currency' => 'currency',
            'dateTime' => new DateTime('2024-01-15T09:30:00Z'),
        ]),
    ]),
);
