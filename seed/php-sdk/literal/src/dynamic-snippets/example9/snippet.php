<?php

namespace Example;

use Seed\SeedClient;
use Seed\Reference\Types\SendRequest;
use Seed\Reference\Types\ContainerObject;
use Seed\Reference\Types\NestedObjectWithLiterals;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->reference->send(
    new SendRequest([
        'prompt' => 'You are a helpful assistant',
        'query' => 'query',
        'stream' => false,
        'ending' => '$ending',
        'context' => "You're super wise",
        'maybeContext' => "You're super wise",
        'containerObject' => new ContainerObject([
            'nestedObjects' => [
                new NestedObjectWithLiterals([
                    'literal1' => 'literal1',
                    'literal2' => 'literal2',
                    'strProp' => 'strProp',
                ]),
                new NestedObjectWithLiterals([
                    'literal1' => 'literal1',
                    'literal2' => 'literal2',
                    'strProp' => 'strProp',
                ]),
            ],
        ]),
    ]),
);
