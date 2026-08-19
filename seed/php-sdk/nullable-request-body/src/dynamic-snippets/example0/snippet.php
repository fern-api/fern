<?php

namespace Example;

use Seed\SeedClient;
use Seed\TestGroup\Requests\TestMethodNameTestGroupRequest;
use Seed\Types\PlainObject;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->testGroup->testMethodName(
    'path_param',
    new TestMethodNameTestGroupRequest([
        'body' => new PlainObject([]),
    ]),
);
