<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\OptionalArgsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->optionalArgs(
    new OptionalArgsRequest([]),
);
