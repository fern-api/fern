<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceGetResourceRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getresource(
    'resourceId',
    new ServiceGetResourceRequest([
        'includeMetadata' => true,
        'format' => 'format',
    ]),
);
