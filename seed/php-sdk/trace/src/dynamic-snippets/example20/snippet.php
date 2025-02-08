<?php

namespace Example;

use Seed\SeedClient;
use Seed\Problem\Requests\GetDefaultStarterFilesRequest;
use Seed\Problem\Types\VariableTypeAndName;

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
                'variableType' => 'todo',
                'name' => 'name',
            ]),
            new VariableTypeAndName([
                'variableType' => 'todo',
                'name' => 'name',
            ]),
        ],
        'outputType' => 'todo',
        'methodName' => 'methodName',
    ]),
);
