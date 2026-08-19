<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    username: '<username>',
    password: '<password>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->basicAuth->getWithBasicAuth();
