<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\StreamXFernStreamingUnionRequest;
use Seed\Types\UnionStreamMessageVariant;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->streamXFernStreamingUnion(
    StreamXFernStreamingUnionRequest::message(false, new UnionStreamMessageVariant([
        'message' => 'message',
        'streamResponse' => false,
        'prompt' => 'prompt',
    ])),
);
