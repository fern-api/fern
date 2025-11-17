<?php

namespace Example;

use Seed\SeedClient;
use Seed\Union\Requests\PaymentRequest;
use Seed\Union\Types\ConvertToken;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->union->testCamelCaseProperties(
    new PaymentRequest([
        'paymentMethod' => new ConvertToken([
            'method' => 'card',
            'tokenId' => 'tok_123',
        ]),
    ]),
);
