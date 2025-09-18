<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Types\Movie;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->createMovie(
    new Movie([
        'id' => 'id',
        'prequel' => 'prequel',
        'title' => 'title',
        'from' => 'from',
        'rating' => 1.1,
        'type' => 'movie',
        'tag' => 'tag',
        'book' => 'book',
        'metadata' => [
            'metadata' => [
                'key' => "value",
            ],
        ],
        'revenue' => 1000000,
    ]),
);
