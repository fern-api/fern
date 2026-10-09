<?php

namespace Example;

use Seed\SeedClient;
use Seed\Reporting\Requests\LoadRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->reporting->load(
    new LoadRequest([]),
);
