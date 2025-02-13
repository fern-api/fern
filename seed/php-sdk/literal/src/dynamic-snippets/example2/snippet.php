<?php

namespace Example;

use Seed\SeedClient;
use Seed\Inlined\Requests\SendLiteralsInlinedRequest;
use Seed\Inlined\Types\ATopLevelLiteral;
use Seed\Inlined\Types\ANestedLiteral;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlined->send(
    new SendLiteralsInlinedRequest([
        'temperature' => 10.1,
        'objectWithLiteral' => new ATopLevelLiteral([
            'nestedLiteral' => new ANestedLiteral([]),
        ]),
        'query' => 'What is the weather today',
    ]),
);
