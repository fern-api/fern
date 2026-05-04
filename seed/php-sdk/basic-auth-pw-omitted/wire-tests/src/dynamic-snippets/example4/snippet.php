<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    username: '<username>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->basicAuth->postWithBasicAuth(
    [
        'key' => "value",
    ],
);
