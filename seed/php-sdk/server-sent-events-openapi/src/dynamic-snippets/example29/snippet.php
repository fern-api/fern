<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\UnionStreamRequestBase;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->validateUnionRequest(
    new UnionStreamRequestBase([
        'streamResponse' => true,
        'prompt' => 'prompt',
    ]),
);
