<?php

namespace Example;

use Seed\SeedClient;
use Seed\Union\Requests\UnionTestCamelCasePropertiesRequest;
use Seed\Types\TokenizeCard;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->union->testcamelcaseproperties(
    new UnionTestCamelCasePropertiesRequest([
        'paymentMethod' => new TokenizeCard([
            'method' => 'method',
            'cardNumber' => 'cardNumber',
        ]),
    ]),
);
