<?php

namespace Example;

use Seed\SeedClient;
use Seed\Queryparam\Requests\QueryParamSendListRequest;
use Seed\Types\Operand;
use Seed\Types\Color;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->queryparam->sendlist(
    new QueryParamSendListRequest([
        'operand' => [
            Operand::GreaterThan->value,
        ],
        'maybeOperand' => [
            Operand::GreaterThan->value,
        ],
        'operandOrColor' => [
            Color::Red->value,
        ],
        'maybeOperandOrColor' => [
            Color::Red->value,
        ],
    ]),
);
