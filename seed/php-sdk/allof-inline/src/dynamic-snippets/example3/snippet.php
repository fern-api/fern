<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\RuleCreateRequest;
use Seed\Types\RuleCreateRequestExecutionContext;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->createRule(
    new RuleCreateRequest([
        'name' => 'name',
        'executionContext' => RuleCreateRequestExecutionContext::Prod->value,
    ]),
);
