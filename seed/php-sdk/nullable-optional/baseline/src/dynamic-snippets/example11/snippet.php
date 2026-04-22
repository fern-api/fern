<?php

namespace Example;

use Seed\SeedClient;
use Seed\NullableOptional\Requests\UpdateTagsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableOptional->updateTags(
    'userId',
    new UpdateTagsRequest([
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
