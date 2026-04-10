<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\NamedMixedPatchRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->namedPatchWithMixed(
    'id',
    new NamedMixedPatchRequest([
        'appId' => 'appId',
        'instructions' => 'instructions',
        'active' => true,
    ]),
);
