<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\JustFileRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->justFile(
    new JustFileRequest([]),
);
