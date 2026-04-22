<?php

namespace Example;

use Seed\SeedClient;
use Seed\Dummy\Requests\GenerateStreamRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->dummy->generateStream(
    new GenerateStreamRequest([
        'stream' => true,
        'numEvents' => 1,
    ]),
);
