<?php

namespace Example;

use Seed\SeedClient;
use Seed\Queryparam\Requests\QueryParamSendRequest;
use Seed\Types\Operand;
use Seed\Types\Color;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->queryparam->send(
    new QueryParamSendRequest([
        'operand' => Operand::GreaterThan->value,
        'maybeOperand' => Operand::GreaterThan->value,
        'operandOrColor' => Color::Red->value,
        'maybeOperandOrColor' => Color::Red->value,
    ]),
);
