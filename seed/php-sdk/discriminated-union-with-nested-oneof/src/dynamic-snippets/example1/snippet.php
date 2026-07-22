<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\AstNode;
use Seed\Types\AstNodeLlm;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createAst(
    AstNode::llm(new AstNodeLlm([
        'model' => 'model',
        'valueSchema' => [
            'value_schema' => [
                'key' => "value",
            ],
        ],
        'prompt' => 'prompt',
    ])),
);
