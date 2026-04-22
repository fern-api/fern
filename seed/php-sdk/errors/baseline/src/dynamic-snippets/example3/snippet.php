<?php

namespace Example;

use Seed\SeedClient;
use Seed\Simple\Types\FooRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->simple->fooWithoutEndpointError(
    new FooRequest([
        'bar' => 'bar',
    ]),
);
