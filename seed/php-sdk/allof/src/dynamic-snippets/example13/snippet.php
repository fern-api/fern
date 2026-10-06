<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TreeRecord;
use DateTime;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createTree(
    new TreeRecord([
        'id' => 'id',
        'treeName' => 'treeName',
        'treeSpecies' => 'treeSpecies',
        'plantedDate' => new DateTime('2023-01-15'),
        'heightInFeet' => 1.1,
        'treeDescription' => 'treeDescription',
    ]),
);
