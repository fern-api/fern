<?php

namespace Example;

use Seed\SeedClient;
use Seed\Problem\Types\CreateProblemRequest;
use Seed\Problem\Types\ProblemDescription;
use Seed\Problem\Types\ProblemDescriptionBoard;
use Seed\Commons\Types\Language;
use Seed\Problem\Types\ProblemFiles;
use Seed\Commons\Types\FileInfo;
use Seed\Problem\Types\VariableTypeAndName;
use Seed\Commons\Types\VariableType;
use Seed\Commons\Types\TestCaseWithExpectedResult;
use Seed\Commons\Types\TestCase;
use Seed\Commons\Types\VariableValue;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->problem->createProblem(
    new CreateProblemRequest([
        'problemName' => 'problemName',
        'problemDescription' => new ProblemDescription([
            'boards' => [
                ProblemDescriptionBoard::html(),
                ProblemDescriptionBoard::html(),
            ],
        ]),
        'files' => [
            Language::Java->value => new ProblemFiles([
                'solutionFile' => new FileInfo([
                    'filename' => 'filename',
                    'contents' => 'contents',
                ]),
                'readOnlyFiles' => [
                    new FileInfo([
                        'filename' => 'filename',
                        'contents' => 'contents',
                    ]),
                    new FileInfo([
                        'filename' => 'filename',
                        'contents' => 'contents',
                    ]),
                ],
            ]),
        ],
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
        'testcases' => [
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [
                        VariableValue::integerValue(),
                        VariableValue::integerValue(),
                    ],
                ]),
                'expectedResult' => VariableValue::integerValue(),
            ]),
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [
                        VariableValue::integerValue(),
                        VariableValue::integerValue(),
                    ],
                ]),
                'expectedResult' => VariableValue::integerValue(),
            ]),
        ],
        'methodName' => 'methodName',
    ]),
);
