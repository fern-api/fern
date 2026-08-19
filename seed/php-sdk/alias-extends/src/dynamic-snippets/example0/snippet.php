<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\InlinedChildRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->extendedInlineRequestBody(
    new InlinedChildRequest([
        'parent' => 'parent',
        'child' => 'child',
    ]),
);
