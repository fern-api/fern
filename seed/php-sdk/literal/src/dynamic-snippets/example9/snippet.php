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
        'query' => 'query',
        'containerObject' => new ContainerObject([
            'nestedObjects' => [
                new NestedObjectWithLiterals([
                    'strProp' => 'strProp',
                ]),
                new NestedObjectWithLiterals([
                    'strProp' => 'strProp',
                ]),
            ],
        ]),
    ]),
);
