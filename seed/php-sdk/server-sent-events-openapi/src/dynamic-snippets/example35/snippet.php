<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\StreamXFernStreamingNullableConditionRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->streamXFernStreamingNullableCondition(
    new StreamXFernStreamingNullableConditionRequest([
        'query' => 'query',
        'stream' => false,
    ]),
);
