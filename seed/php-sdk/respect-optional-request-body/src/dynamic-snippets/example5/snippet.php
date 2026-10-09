<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\RefundRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->bulkRefund(
    new RefundRequest([]),
);
