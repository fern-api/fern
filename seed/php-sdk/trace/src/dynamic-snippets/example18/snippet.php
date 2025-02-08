<?php

namespace Example;

use Seed\SeedClient;
use Seed\Problem\Types\CreateProblemRequest;
use Seed\Problem\Types\ProblemDescription;
use Seed\Commons\Types\Language;
use Seed\Problem\Types\ProblemFiles;
use Seed\Commons\Types\FileInfo;
use Seed\Problem\Types\VariableTypeAndName;
use Seed\Commons\Types\TestCaseWithExpectedResult;
use Seed\Commons\Types\TestCase;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->problem->updateProblem(
    'problemId',
    new CreateProblemRequest([
        'problemName' => 'problemName',
        'problemDescription' => new ProblemDescription([
            'boards' => [
                'todo',
                'todo',
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
                'variableType' => 'todo',
                'name' => 'name',
            ]),
            new VariableTypeAndName([
                'variableType' => 'todo',
                'name' => 'name',
            ]),
        ],
        'outputType' => 'todo',
        'testcases' => [
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [
                        'todo',
                        'todo',
                    ],
                ]),
                'expectedResult' => 'todo',
            ]),
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [
                        'todo',
                        'todo',
                    ],
                ]),
                'expectedResult' => 'todo',
            ]),
        ],
        'methodName' => 'methodName',
    ]),
);
