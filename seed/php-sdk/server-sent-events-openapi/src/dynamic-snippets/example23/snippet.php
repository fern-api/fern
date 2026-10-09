<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\StreamXFernStreamingSharedSchemaRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->streamXFernStreamingSharedSchema(
    new StreamXFernStreamingSharedSchemaRequest([
        'prompt' => 'prompt',
        'model' => 'model',
        'stream' => false,
    ]),
);
