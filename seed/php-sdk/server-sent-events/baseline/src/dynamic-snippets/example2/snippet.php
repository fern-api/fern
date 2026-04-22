<?php

namespace Example;

use Seed\SeedClient;
use Seed\Completions\Requests\StreamCompletionRequestWithoutTerminator;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->completions->streamWithoutTerminator(
    new StreamCompletionRequestWithoutTerminator([
        'query' => 'query',
    ]),
);
