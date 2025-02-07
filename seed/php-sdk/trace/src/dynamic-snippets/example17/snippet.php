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
$client->problem->createProblem(
    new CreateProblemRequest([
        'problemName' => 'problemName',
        'problemDescription' => new ProblemDescription([
            'boards' => [],
        ]),
        'files' => [
            Language::Java => new ProblemFiles([
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
                'name' => 'name',
            ]),
            new VariableTypeAndName([
                'name' => 'name',
            ]),
        ],
        'testcases' => [
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [],
                ]),
            ]),
            new TestCaseWithExpectedResult([
                'testCase' => new TestCase([
                    'id' => 'id',
                    'params' => [],
                ]),
            ]),
        ],
        'methodName' => 'methodName',
    ]),
);
