<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Movie;
use Seed\Types\MovieType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->createmovie(
    new Movie([
        'id' => 'id',
        'prequel' => 'prequel',
        'title' => 'title',
        'from' => 'from',
        'rating' => 1.1,
        'type' => MovieType::Movie->value,
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
