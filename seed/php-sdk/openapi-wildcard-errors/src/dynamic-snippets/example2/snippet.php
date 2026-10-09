<?php

namespace Example;

use Seed\SeedClient;
use Seed\Items\Requests\CreateItemRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->items->createItem(
    new CreateItemRequest([
        'name' => 'name',
    ]),
);
