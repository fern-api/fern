<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\RegularPatchRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->regularPatch(
    'id',
    new RegularPatchRequest([
        'field1' => 'field1',
        'field2' => 1,
    ]),
);
