<?php

namespace Example;

use Seed\SeedClient;
use Seed\Payment\Requests\CreatePaymentRequest;
use Seed\Payment\Types\Currency;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->payment->create(
    new CreatePaymentRequest([
        'amount' => 1,
        'currency' => Currency::Usd->value,
    ]),
);
