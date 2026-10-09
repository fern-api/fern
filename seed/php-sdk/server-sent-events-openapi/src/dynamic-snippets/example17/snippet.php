<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\StreamXFernStreamingConditionStreamRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->streamXFernStreamingConditionStream(
    new StreamXFernStreamingConditionStreamRequest([
        'query' => 'query',
        'stream' => true,
    ]),
);
