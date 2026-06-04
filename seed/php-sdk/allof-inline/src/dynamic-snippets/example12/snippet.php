<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TreeRecord;

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
    ]),
);
