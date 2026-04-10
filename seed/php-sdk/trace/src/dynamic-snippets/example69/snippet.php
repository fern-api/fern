<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->v2V3Problem->v2V3ProblemGetLatestProblem(
    'problemId',
);
