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
        'queryParamObject' => new PlainObject([
            'id' => 'id',
            'name' => 'name',
        ]),
        'queryParamInteger' => 1,
        'body' => new PlainObject([
            'id' => 'id',
            'name' => 'name',
        ]),
    ]),
);
