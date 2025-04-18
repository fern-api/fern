<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\HeaderAuthRequest;

$client = new SeedClient(
    apiKey: '<value>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->getWithHeader(
    new HeaderAuthRequest([
        'xEndpointHeader' => 'X-Endpoint-Header',
    ]),
);
