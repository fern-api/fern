<?php

namespace Example;

use Seed\SeedClient;
use Seed\Completions\Requests\StreamEventsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->completions->streamEvents(
    new StreamEventsRequest([
        'query' => 'query',
    ]),
);
