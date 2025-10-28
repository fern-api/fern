<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\UpdateFooRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->updateFoo(
    'id',
    new UpdateFooRequest([
        'xIdempotencyKey' => 'X-Idempotency-Key',
        'nullableText' => 'nullable_text',
        'nullableNumber' => 1.1,
        'nonNullableText' => 'non_nullable_text',
    ]),
);
