<?php

namespace Example;

use Seed\SeedClient;
use Seed\Completions\Requests\CompletionsStreamEventsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->completions->streamevents(
    new CompletionsStreamEventsRequest([
        'query' => 'query',
    ]),
);
