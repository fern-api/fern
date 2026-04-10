<?php

namespace Example;

use Seed\SeedClient;
use Seed\Problem\Requests\ProblemUpdateProblemRequest;
use Seed\Types\CreateProblemRequest;
use Seed\Types\ProblemDescription;
use Seed\Types\ProblemDescriptionBoard;
use Seed\Types\ProblemDescriptionBoardHtml;
use Seed\Types\ProblemFiles;
use Seed\Types\FileInfo;
use Seed\Types\VariableTypeAndName;
use Seed\Types\VariableTypeZero;
use Seed\Types\VariableTypeZeroType;
use Seed\Types\TestCaseWithExpectedResult;
use Seed\Types\TestCase;
use Seed\Types\VariableValueZero;
use Seed\Types\VariableValueZeroType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->problem->updateproblem(
    'problemId',
    new ProblemUpdateProblemRequest([
        'body' => new CreateProblemRequest([
            'problemName' => 'problemName',
            'problemDescription' => new ProblemDescription([
                'boards' => [
                    ProblemDescriptionBoard::html(new ProblemDescriptionBoardHtml([
                        'value' => 'value',
                    ])),
                    ProblemDescriptionBoard::html(new ProblemDescriptionBoardHtml([
                        'value' => 'value',
                    ])),
                ],
            ]),
            'files' => [
                'files' => new ProblemFiles([
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
                    'variableType' => new VariableTypeZero([
                        'type' => VariableTypeZeroType::IntegerType->value,
                    ]),
                    'name' => 'name',
                ]),
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
            'testcases' => [
                new TestCaseWithExpectedResult([
                    'testCase' => new TestCase([
                        'id' => 'id',
                        'params' => [
                            new VariableValueZero([
                                'type' => VariableValueZeroType::IntegerValue->value,
                                'value' => 1,
                            ]),
                            new VariableValueZero([
                                'type' => VariableValueZeroType::IntegerValue->value,
                                'value' => 1,
                            ]),
                        ],
                    ]),
                    'expectedResult' => new VariableValueZero([
                        'type' => VariableValueZeroType::IntegerValue->value,
                        'value' => 1,
                    ]),
                ]),
                new TestCaseWithExpectedResult([
                    'testCase' => new TestCase([
                        'id' => 'id',
                        'params' => [
                            new VariableValueZero([
                                'type' => VariableValueZeroType::IntegerValue->value,
                                'value' => 1,
                            ]),
                            new VariableValueZero([
                                'type' => VariableValueZeroType::IntegerValue->value,
                                'value' => 1,
                            ]),
                        ],
                    ]),
                    'expectedResult' => new VariableValueZero([
                        'type' => VariableValueZeroType::IntegerValue->value,
                        'value' => 1,
                    ]),
                ]),
            ],
            'methodName' => 'methodName',
        ]),
    ]),
);
