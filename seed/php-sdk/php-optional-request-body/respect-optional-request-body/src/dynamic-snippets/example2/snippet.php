<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\RefundWithHeaderRequest;
use Seed\Types\RefundRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->refundWithHeader(
    new RefundWithHeaderRequest([
        'xIdempotencyKey' => 'X-Idempotency-Key',
        'body' => new RefundRequest([
            'amount' => 1.1,
        ]),
    ]),
);
