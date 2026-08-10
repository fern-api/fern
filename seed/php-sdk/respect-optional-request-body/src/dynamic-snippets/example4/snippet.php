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
    'id',
    new RequiredRefundRequest([
        'body' => new RefundRequest([
            'amount' => 1.1,
        ]),
    ]),
);
