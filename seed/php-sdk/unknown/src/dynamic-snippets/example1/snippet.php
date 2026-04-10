<?php

namespace Example;

use Seed\SeedClient;
use Seed\Unknown\Requests\MyObject;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->unknown->postobject(
    new MyObject([
        'unknown' => [
            'key' => "value",
        ],
    ]),
);
