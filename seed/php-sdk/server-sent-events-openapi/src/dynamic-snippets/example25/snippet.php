<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\StreamXFernStreamingUnionStreamRequest;
use Seed\Types\UnionStreamMessageVariant;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->streamXFernStreamingUnionStream(
    StreamXFernStreamingUnionStreamRequest::message(true, new UnionStreamMessageVariant([
        'message' => 'message',
        'streamResponse' => true,
        'prompt' => 'prompt',
    ])),
);
