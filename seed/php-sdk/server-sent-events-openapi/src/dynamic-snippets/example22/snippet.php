<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\SharedCompletionRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->validateCompletion(
    new SharedCompletionRequest([
        'prompt' => 'prompt',
        'model' => 'model',
    ]),
);
