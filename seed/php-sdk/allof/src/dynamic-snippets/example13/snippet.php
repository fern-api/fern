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
        'treeSpecies' => 'treeSpecies',
        'heightInFeet' => 1.1,
        'id' => 'id',
        'treeName' => 'treeName',
        'treeDescription' => 'treeDescription',
        'plantedDate' => new DateTime('2023-01-15'),
    ]),
);
