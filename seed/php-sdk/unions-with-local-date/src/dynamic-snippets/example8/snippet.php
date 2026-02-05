<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Types\UnionWithTime;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->types->update(
    UnionWithTime::value(),
);
