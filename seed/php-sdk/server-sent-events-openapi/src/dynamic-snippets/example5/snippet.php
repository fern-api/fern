<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\StreamRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->streamDataContext(
    new StreamRequest([
        'query' => 'query',
    ]),
);
