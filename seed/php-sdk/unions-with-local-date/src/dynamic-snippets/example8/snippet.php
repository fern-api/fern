<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\UnionWithTime;
use Seed\Types\UnionWithTimeValue;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->types->update(
    UnionWithTime::value(new UnionWithTimeValue([])),
);
