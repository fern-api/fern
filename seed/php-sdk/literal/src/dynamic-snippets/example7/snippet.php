<?php

namespace Example;

use Seed\SeedClient;
use Seed\Query\Requests\SendLiteralsInQueryRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->query->send(
    new SendLiteralsInQueryRequest([
        'query' => 'query',
    ]),
);
