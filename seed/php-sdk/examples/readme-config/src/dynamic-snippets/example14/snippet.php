<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceGetMetadataRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getmetadata(
    new ServiceGetMetadataRequest([
        'shallow' => true,
        'tag' => [
            'tag',
        ],
        'apiVersion' => 'apiVersion',
    ]),
);
