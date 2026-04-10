<?php

namespace Example;

use Seed\SeedClient;
use Seed\Foo\Requests\FooFindRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->foo->find(
    new FooFindRequest([
        'optionalString' => 'optionalString',
        'publicProperty' => 'publicProperty',
        'privateProperty' => 1,
    ]),
);
