<?php

namespace Example;

use Seed\SeedClient;
use Seed\Foo\Requests\FindRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->foo->find(
    new FindRequest([
        'optionalString' => 'optionalString',
        'publicProperty' => 'publicProperty',
        'privateProperty' => 1,
    ]),
);
