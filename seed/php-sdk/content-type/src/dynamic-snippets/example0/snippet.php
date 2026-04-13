<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServicePatchRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->patch(
    new ServicePatchRequest([]),
);
