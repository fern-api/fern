<?php

namespace Example;

use Fern\SeedClient;
use Fern\Imdb\Requests\CreateMovieRequest;

$client = new SeedClient(
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
