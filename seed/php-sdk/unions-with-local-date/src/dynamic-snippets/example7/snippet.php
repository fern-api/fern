<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Types\UnionWithTime;
use DateTime;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->types->update(
    UnionWithTime::datetime(new DateTime('1994-01-01T01:01:01Z')),
);
