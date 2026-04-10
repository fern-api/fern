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
        'prompt' => 'You are a helpful assistant',
        'context' => "You're super wise",
        'query' => 'query',
        'temperature' => 1.1,
        'stream' => false,
        'aliasedContext' => "You're super wise",
        'maybeContext' => "You're super wise",
        'objectWithLiteral' => new ATopLevelLiteral([
            'nestedLiteral' => new ANestedLiteral([
                'myLiteral' => 'How super cool',
            ]),
        ]),
    ]),
);
