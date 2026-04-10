<?php

namespace Example;

use Seed\SeedClient;
use Seed\Dummy\Requests\DummyGenerateRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->dummy->generate(
    new DummyGenerateRequest([
        'stream' => true,
        'numEvents' => 1,
    ]),
);
