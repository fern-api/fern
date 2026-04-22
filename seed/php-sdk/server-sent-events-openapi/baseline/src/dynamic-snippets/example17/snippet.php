<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\StreamXFernStreamingConditionRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->streamXFernStreamingCondition(
    new StreamXFernStreamingConditionRequest([
        'query' => 'query',
        'stream' => false,
    ]),
);
