<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
        'apiKey' => '<X-API-Key>',
    ],
);
$client->user->get();
