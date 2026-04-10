<?php

namespace Example;

use Seed\SeedClient;
use Seed\Inlined\Requests\InlinedSendRequest;
use Seed\Inlined\Types\InlinedSendRequestPrompt;
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
        'query' => 'query',
        'stream' => true,
        'aliasedContext' => SomeAliasedLiteral::YoureSuperWise->value,
        'objectWithLiteral' => new ATopLevelLiteral([
            'nestedLiteral' => new ANestedLiteral([
                'myLiteral' => ANestedLiteralMyLiteral::HowSuperCool->value,
            ]),
        ]),
    ]),
);
