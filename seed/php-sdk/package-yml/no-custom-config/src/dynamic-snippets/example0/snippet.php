<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\EchoRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->echo_(
    'id-ksfd9c1',
    new EchoRequest([
        'name' => 'Hello world!',
        'size' => 20,
    ]),
);
