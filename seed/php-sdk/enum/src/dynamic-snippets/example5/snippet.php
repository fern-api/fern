<?php

namespace Example;

use Seed\SeedClient;
use Seed\QueryParam\Requests\SendEnumAsQueryParamRequest;
use Seed\Types\Operand;
use Seed\Types\Color;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->queryParam->send(
    new SendEnumAsQueryParamRequest([
        'operand' => Operand::GreaterThan->value,
        'maybeOperand' => Operand::GreaterThan->value,
        'operandOrColor' => Color::Red->value,
        'maybeOperandOrColor' => Color::Red->value,
    ]),
);
