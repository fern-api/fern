<?php

namespace Example;

use Seed\SeedClient;

$client = new SeedClient(
    customAuthScheme: '<value>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->customAuth->postWithCustomAuth(
    [
        'key' => "value",
    ],
);
