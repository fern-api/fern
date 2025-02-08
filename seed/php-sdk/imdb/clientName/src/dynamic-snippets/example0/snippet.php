<?php

namespace Example;

use Seed\FernClient;
use Seed\Imdb\Types\CreateMovieRequest;

$client = new FernClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->imdb->createMovie(
    new CreateMovieRequest([
        'title' => 'title',
        'rating' => 1.1,
    ]),
);
