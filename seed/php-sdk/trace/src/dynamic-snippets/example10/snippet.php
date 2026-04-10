<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\AdminStoreTracedTestCaseRequest;
use Seed\Types\TestCaseResultWithStdout;
use Seed\Types\TestCaseResult;
use Seed\Types\VariableValueZero;
use Seed\Types\VariableValueZeroType;
use Seed\Types\ActualResultZero;
use Seed\Types\ActualResultZeroType;
use Seed\Types\TraceResponse;
use Seed\Types\StackInformation;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->admin->storetracedtestcase(
    'submissionId',
    'testCaseId',
    new AdminStoreTracedTestCaseRequest([
        'result' => new TestCaseResultWithStdout([
            'result' => new TestCaseResult([
                'expectedResult' => new VariableValueZero([
                    'type' => VariableValueZeroType::IntegerValue->value,
                ]),
                'actualResult' => new ActualResultZero([
                    'type' => ActualResultZeroType::Value->value,
                ]),
                'passed' => true,
            ]),
            'stdout' => 'stdout',
        ]),
        'traceResponses' => [
            new TraceResponse([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                ]),
            ]),
        ],
    ]),
);
