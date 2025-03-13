<?php

namespace Example;

use Seed\SeedClient;
use Seed\Package\Requests\TestRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->package->test(
    new TestRequest([
        'for' => 'for',
    ]),
);
