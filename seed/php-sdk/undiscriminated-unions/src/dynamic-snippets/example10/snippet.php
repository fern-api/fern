<?php

namespace Example;

use Seed\SeedClient;
use Seed\Union\Requests\PaymentRequest;
use Seed\Union\Types\TokenizeCard;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->union->testCamelCaseProperties(
    new PaymentRequest([
        'paymentMethod' => new TokenizeCard([
            'method' => 'method',
            'cardNumber' => 'cardNumber',
        ]),
    ]),
);
