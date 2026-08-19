<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    username: 'YOUR_USERNAME',
    accessToken: 'YOUR_PASSWORD',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->basicAuth->getWithBasicAuth();
