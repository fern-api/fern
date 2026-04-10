<?php

namespace Example;

use Seed\FernClient;
use Seed\Imdb\Requests\CreateMovieRequest;

$client = new FernClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->imdb->createmovie(
    new CreateMovieRequest([
        'title' => 'title',
        'rating' => 1.1,
    ]),
);
