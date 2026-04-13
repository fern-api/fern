<?php

namespace Example;

use Seed\SeedClient;
use Seed\Package\Requests\PackageTestRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->package->test(
    new PackageTestRequest([
        'for' => 'for',
    ]),
);
