<?php

namespace Example;

use Seed\SeedClient;
use Seed\Testgroup\Requests\TestGroupTestMethodNameRequest;
use Seed\Types\PlainObject;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->testgroup->testMethodName(
    'path_param',
    new TestGroupTestMethodNameRequest([
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
