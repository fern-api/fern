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
        'prompt' => 'You are a helpful assistant',
        'context' => "You're super wise",
        'aliasedContext' => "You're super wise",
        'maybeContext' => "You're super wise",
        'objectWithLiteral' => new ATopLevelLiteral([
            'nestedLiteral' => new ANestedLiteral([
                'myLiteral' => 'How super cool',
            ]),
        ]),
        'stream' => false,
        'query' => 'What is the weather today',
    ]),
);
