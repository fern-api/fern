<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\CreatePlantWithSchemaRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createPlantWithSchema(
    new CreatePlantWithSchemaRequest([
        'name' => 'name',
        'species' => 'species',
    ]),
);
