<?php

namespace Example;

use Seed\SeedClient;
use Seed\Completions\Requests\CompletionsStreamRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->completions->stream(
    new CompletionsStreamRequest([
        'query' => 'query',
    ]),
);
