<?php

namespace Example;

use Custom\Package\Path\SeedClient;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->imdb->getMovie(
    'movieId',
);
