<?php

namespace Example;

use Seed\SeedClient;
use Seed\Reference\Requests\SendRequest;
use Seed\Reference\Types\SendRequestPrompt;
use Seed\Reference\Types\SendRequestEnding;
use Seed\Types\SomeLiteral;
use Seed\Types\ContainerObject;
use Seed\Types\NestedObjectWithLiterals;
use Seed\Types\NestedObjectWithLiteralsLiteral1;
use Seed\Types\NestedObjectWithLiteralsLiteral2;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->reference->send(
    new SendRequest([
        'prompt' => SendRequestPrompt::YouAreAHelpfulAssistant->value,
        'query' => 'query',
        'stream' => true,
        'ending' => SendRequestEnding::Ending->value,
        'context' => SomeLiteral::YoureSuperWise->value,
        'maybeContext' => SomeLiteral::YoureSuperWise->value,
        'containerObject' => new ContainerObject([
            'nestedObjects' => [
                new NestedObjectWithLiterals([
                    'literal1' => NestedObjectWithLiteralsLiteral1::Literal1->value,
                    'literal2' => NestedObjectWithLiteralsLiteral2::Literal2->value,
                    'strProp' => 'strProp',
                ]),
                new NestedObjectWithLiterals([
                    'literal1' => NestedObjectWithLiteralsLiteral1::Literal1->value,
                    'literal2' => NestedObjectWithLiteralsLiteral2::Literal2->value,
                    'strProp' => 'strProp',
                ]),
            ],
        ]),
    ]),
);
