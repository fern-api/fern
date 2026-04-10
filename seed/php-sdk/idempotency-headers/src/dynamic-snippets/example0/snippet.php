<?php

namespace Example;

use Seed\SeedClient;
use Seed\Payment\Requests\PaymentCreateRequest;
use Seed\Types\Currency;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->payment->create(
    new PaymentCreateRequest([
        'amount' => 1,
        'currency' => Currency::Usd->value,
    ]),
);
