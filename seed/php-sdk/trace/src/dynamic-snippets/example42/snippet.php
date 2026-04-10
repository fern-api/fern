<?php

namespace Example;

use Seed\SeedClient;
use Seed\Problem\Requests\ProblemGetDefaultStarterFilesRequest;
use Seed\Types\VariableTypeAndName;
use Seed\Types\VariableTypeZero;
use Seed\Types\VariableTypeZeroType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->problem->getdefaultstarterfiles(
    new ProblemGetDefaultStarterFilesRequest([
        'inputParams' => [
            new VariableTypeAndName([
                'variableType' => new VariableTypeZero([
                    'type' => VariableTypeZeroType::IntegerType->value,
                ]),
                'name' => 'name',
            ]),
        ],
        'outputType' => new VariableTypeZero([
            'type' => VariableTypeZeroType::IntegerType->value,
        ]),
        'methodName' => 'methodName',
    ]),
);
