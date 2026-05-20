<?php

namespace Example;

use Seed\SeedClient;
use Seed\Completions\Requests\StreamCompletionRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->completions->stream(
    new StreamCompletionRequest([
        'query' => 'query',
    ]),
);
