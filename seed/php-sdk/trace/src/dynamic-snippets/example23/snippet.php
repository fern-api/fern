<?php

namespace Example;

use Seed\SeedClient;
use Seed\Problem\Requests\GetDefaultStarterFilesRequest;
use Seed\Problem\Types\VariableTypeAndName;
use Seed\Commons\Types\VariableType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->problem->getDefaultStarterFiles(
    new GetDefaultStarterFilesRequest([
        'inputParams' => [
            new VariableTypeAndName([
                'variableType' => VariableType::integerType(),
                'name' => 'name',
            ]),
            new VariableTypeAndName([
                'variableType' => VariableType::integerType(),
                'name' => 'name',
            ]),
        ],
        'outputType' => VariableType::integerType(),
        'methodName' => 'methodName',
    ]),
);
