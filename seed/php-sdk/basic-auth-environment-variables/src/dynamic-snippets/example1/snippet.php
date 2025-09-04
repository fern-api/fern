<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    username: '<username>',
    accessToken: '<password>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->basicAuth->getWithBasicAuth();
