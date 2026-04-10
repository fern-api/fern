<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceNamedPatchWithMixedRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->namedpatchwithmixed(
    'id',
    new ServiceNamedPatchWithMixedRequest([
        'appId' => 'appId',
        'instructions' => 'instructions',
        'active' => true,
    ]),
);
