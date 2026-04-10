<?php

namespace Example;

use Seed\FernClient;

$client = new FernClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->imdb->getMovie(
    'movieId',
);
