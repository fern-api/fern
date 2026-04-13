<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\FooRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->simple->foowithexamples(
    new FooRequest([
        'bar' => 'bar',
    ]),
);
