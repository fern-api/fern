<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\NullableOptionalUpdateTagsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->updatetags(
    'userId',
    new NullableOptionalUpdateTagsRequest([
        'tags' => [
            'tags',
            'tags',
        ],
        'categories' => [
            'categories',
            'categories',
        ],
        'labels' => [
            'labels',
            'labels',
        ],
    ]),
);
