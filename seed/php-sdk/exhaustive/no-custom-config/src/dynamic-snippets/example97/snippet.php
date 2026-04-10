<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesAnimalZero;
use Seed\Types\TypesAnimalZeroAnimal;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsUnion->endpointsUnionGetAndReturnUnion(
    new TypesAnimalZero([
        'animal' => TypesAnimalZeroAnimal::Dog->value,
        'name' => 'name',
        'likesToWoof' => true,
    ]),
);
