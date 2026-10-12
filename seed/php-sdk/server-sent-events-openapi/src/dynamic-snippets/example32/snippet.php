<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\StreamXFernStreamingNullableConditionStreamRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->streamXFernStreamingNullableConditionStream(
    new StreamXFernStreamingNullableConditionStreamRequest([
        'query' => 'query',
        'stream' => true,
    ]),
);
