<?php

namespace Example;

use Seed\SeedClient;
use Seed\Reporting\Requests\LoadRequest;
use Seed\Reporting\Types\LoadRequestCache;
use Seed\Reporting\Types\LoadRequestStatus;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->reporting->load(
    new LoadRequest([
        'cache' => LoadRequestCache::StaleIfSlow->value,
        'status' => LoadRequestStatus::Active->value,
    ]),
);
