<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\RefundBody;
use Seed\Types\RefundRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->refund(
    'refund-id',
    new RefundBody([
        'body' => new RefundRequest([]),
    ]),
);
