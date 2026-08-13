<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\RequiredRefundRequest;
use Seed\Types\RefundRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->requiredRefund(
    'refund-id',
    new RequiredRefundRequest([
        'body' => new RefundRequest([
            'amount' => 60,
        ]),
    ]),
);
