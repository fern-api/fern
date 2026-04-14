<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\StreamXFernStreamingSharedSchemaStreamRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->streamXFernStreamingSharedSchemaStream(
    new StreamXFernStreamingSharedSchemaStreamRequest([
        'prompt' => 'prompt',
        'model' => 'model',
        'stream' => true,
    ]),
);
