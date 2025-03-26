<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlinedRequest\Requests\SendEnumInlinedRequest;
use Seed\Types\Operand;
use Seed\Types\Color;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlinedRequest->send(
    new SendEnumInlinedRequest([
        'operand' => Operand::GreaterThan->value,
        'operandOrColor' => Color::Red->value,
    ]),
);
