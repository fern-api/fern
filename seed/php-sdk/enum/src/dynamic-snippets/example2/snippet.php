<?php

namespace Example;

use Seed\SeedClient;
use Seed\Inlinedrequest\Requests\InlinedRequestSendRequest;
use Seed\Types\Operand;
use Seed\Types\Color;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlinedrequest->send(
    new InlinedRequestSendRequest([
        'operand' => Operand::GreaterThan->value,
        'operandOrColor' => Color::Red->value,
    ]),
);
