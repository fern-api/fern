<?php

namespace Example;

use Seed\SeedClient;
use Seed\Dummy\Requests\Generateequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->dummy->generate(
    new Generateequest([
        'stream' => false,
        'numEvents' => 5,
    ]),
);
