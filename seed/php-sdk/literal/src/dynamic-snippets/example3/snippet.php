<?php

namespace Example;

use Seed\SeedClient;
use Seed\Inlined\Requests\InlinedSendRequest;
use Seed\Inlined\Types\InlinedSendRequestPrompt;
use Seed\Inlined\Types\InlinedSendRequestContext;
use Seed\Types\SomeAliasedLiteral;
use Seed\Types\ATopLevelLiteral;
use Seed\Types\ANestedLiteral;
use Seed\Types\ANestedLiteralMyLiteral;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlined->send(
    new InlinedSendRequest([
        'prompt' => InlinedSendRequestPrompt::YouAreAHelpfulAssistant->value,
        'context' => InlinedSendRequestContext::YoureSuperWise->value,
        'query' => 'query',
        'temperature' => 1.1,
        'stream' => true,
        'aliasedContext' => SomeAliasedLiteral::YoureSuperWise->value,
        'maybeContext' => SomeAliasedLiteral::YoureSuperWise->value,
        'objectWithLiteral' => new ATopLevelLiteral([
            'nestedLiteral' => new ANestedLiteral([
                'myLiteral' => ANestedLiteralMyLiteral::HowSuperCool->value,
            ]),
        ]),
    ]),
);
