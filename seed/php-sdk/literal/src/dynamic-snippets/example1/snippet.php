<?php

namespace Example;

use Seed\SeedClient;
use Seed\Headers\Requests\SendLiteralsInHeadersRequest;

$client = new SeedClient(
    version: '02-02-2024',
    auditLogging: true,
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->headers->send(
    new SendLiteralsInHeadersRequest([
        'endpointVersion' => '02-12-2024',
        'async' => true,
        'query' => 'query',
    ]),
);
