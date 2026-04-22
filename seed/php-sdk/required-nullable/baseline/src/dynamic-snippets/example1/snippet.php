<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\GetFooRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->getFoo(
    new GetFooRequest([
        'optionalBaz' => 'optional_baz',
        'optionalNullableBaz' => 'optional_nullable_baz',
        'requiredBaz' => 'required_baz',
        'requiredNullableBaz' => 'required_nullable_baz',
    ]),
);
