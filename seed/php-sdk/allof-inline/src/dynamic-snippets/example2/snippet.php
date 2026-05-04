<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\RuleCreateRequest;
use Seed\Types\RuleExecutionContext;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createRule(
    new RuleCreateRequest([
        'name' => 'name',
        'executionContext' => RuleExecutionContext::Prod->value,
    ]),
);
