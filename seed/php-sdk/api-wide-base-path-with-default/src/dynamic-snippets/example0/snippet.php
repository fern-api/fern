<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Widget;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->widgets->create(
    'v1beta',
    new Widget([
        'name' => 'name',
    ]),
);
