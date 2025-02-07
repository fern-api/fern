<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\Inlined;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->extendedInlineRequestBody(
    new Inlined([
        'unique' => 'unique',
    ]),
);
