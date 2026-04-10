<?php

namespace Example;

use Seed\SeedClient;
use Seed\Headers\Requests\HeadersSendRequest;
use Seed\Types\Operand;
use Seed\Types\Color;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->headers->send(
    new HeadersSendRequest([
        'operand' => Operand::GreaterThan->value,
        'maybeOperand' => Operand::GreaterThan->value,
        'operandOrColor' => Color::Red->value,
    ]),
);
