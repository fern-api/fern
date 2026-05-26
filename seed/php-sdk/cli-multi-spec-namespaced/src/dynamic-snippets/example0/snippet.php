<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    apiKey: '<X-Api-Key>',
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->v1->listUsers();
