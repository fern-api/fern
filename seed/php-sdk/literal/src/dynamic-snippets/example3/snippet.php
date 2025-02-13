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
        'query' => 'query',
        'temperature' => 1.1,
        'objectWithLiteral' => new ATopLevelLiteral([
            'nestedLiteral' => new ANestedLiteral([]),
        ]),
    ]),
);
