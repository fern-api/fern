<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\ExactRefundRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->refundExactAmount(
    'id',
    new ExactRefundRequest([
        'amount' => 1.1,
    ]),
);
