<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceRegularPatchRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->regularpatch(
    'id',
    new ServiceRegularPatchRequest([
        'field1' => 'field1',
        'field2' => 1,
    ]),
);
