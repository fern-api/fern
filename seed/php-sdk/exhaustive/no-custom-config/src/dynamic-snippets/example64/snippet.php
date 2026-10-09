<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlinedRequests\Requests\PostWithArrayBodyAndHeaders;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlinedRequests->postWithArrayBodyAndHeaders(
    new PostWithArrayBodyAndHeaders([
        'xCustomHeader' => 'X-Custom-Header',
        'body' => [
            'string',
            'string',
        ],
    ]),
);
