<?php

namespace Example;

use Seed\SeedClient;
use Seed\Dummy\Requests\GenerateRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->dummy->generate(
    new GenerateRequest([
        'stream' => false,
        'numEvents' => 5,
    ]),
);
