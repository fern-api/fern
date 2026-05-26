<?php

namespace Example;

use Seed\SeedClient;
use Seed\Completions\Requests\StreamCompletionRequestNonResumable;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->completions->streamNonResumable(
    new StreamCompletionRequestNonResumable([
        'query' => 'query',
    ]),
);
