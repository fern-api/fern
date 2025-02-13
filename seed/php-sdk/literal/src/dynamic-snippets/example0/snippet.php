<?php

namespace Example;

use Seed\SeedClient;
use Seed\Headers\Requests\SendLiteralsInHeadersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->headers->send(
    new SendLiteralsInHeadersRequest([
        'query' => 'What is the weather today',
    ]),
);
