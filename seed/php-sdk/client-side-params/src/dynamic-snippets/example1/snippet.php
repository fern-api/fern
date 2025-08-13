<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\GetResourceRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getResource(
    'resourceId',
    new GetResourceRequest([
        'includeMetadata' => true,
        'format' => 'json',
    ]),
);
