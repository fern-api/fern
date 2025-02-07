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
        'prompt' => 'You are a helpful assistant',
        'optionalPrompt' => 'You are a helpful assistant',
        'aliasPrompt' => 'You are a helpful assistant',
        'aliasOptionalPrompt' => 'You are a helpful assistant',
        'stream' => false,
        'optionalStream' => false,
        'aliasStream' => false,
        'aliasOptionalStream' => false,
        'query' => 'What is the weather today',
    ]),
);
