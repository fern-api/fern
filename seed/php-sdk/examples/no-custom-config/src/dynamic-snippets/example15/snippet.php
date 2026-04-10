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
        'id' => 'movie-c06a4ad7',
        'prequel' => 'movie-cv9b914f',
        'title' => 'The Boy and the Heron',
        'from' => 'Hayao Miyazaki',
        'rating' => 8,
        'type' => 'movie',
        'tag' => 'tag-wf9as23d',
        'metadata' => [
            'actors' => [
                "Christian Bale",
                "Florence Pugh",
                "Willem Dafoe",
            ],
            'releaseDate' => "2023-12-08",
            'ratings' => [
                'rottenTomatoes' => 97,
                'imdb' => 7.6,
            ],
        ],
        'revenue' => 1000000,
    ]),
);
