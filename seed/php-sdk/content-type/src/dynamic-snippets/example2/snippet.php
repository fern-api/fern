<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServicePatchComplexRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->patchcomplex(
    'id',
    new ServicePatchComplexRequest([]),
);
