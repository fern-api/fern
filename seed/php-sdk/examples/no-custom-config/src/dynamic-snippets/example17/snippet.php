<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\GetMetadataRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getMetadata(
    new GetMetadataRequest([
        'shallow' => false,
        'tag' => [
            'development',
        ],
        'xApiVersion' => '0.0.1',
    ]),
);
