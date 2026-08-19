<?php

namespace Example;

use Fern\SeedClient;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->imdb->getMovie(
    'movieId',
);
