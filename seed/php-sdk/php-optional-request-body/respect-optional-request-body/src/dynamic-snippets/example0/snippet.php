<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\RefundRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->refund(
    'id',
    new RefundRequest([
        'amount' => 1.1,
    ]),
);
