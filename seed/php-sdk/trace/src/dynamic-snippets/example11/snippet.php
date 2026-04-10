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
use Seed\Types\DebugVariableValueZero;
use Seed\Types\DebugVariableValueZeroType;
use Seed\Types\ExpressionLocation;
use Seed\Types\StackInformation;
use Seed\Types\StackFrame;
use Seed\Types\Scope;

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
                    'value' => 1,
                ]),
                'actualResult' => new ActualResultZero([
                    'type' => ActualResultZeroType::Value->value,
                    'value' => new VariableValueZero([
                        'type' => VariableValueZeroType::IntegerValue->value,
                        'value' => 1,
                    ]),
                ]),
                'passed' => true,
            ]),
            'stdout' => 'stdout',
        ]),
        'traceResponses' => [
            new TraceResponse([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'returnValue' => new DebugVariableValueZero([
                    'type' => DebugVariableValueZeroType::IntegerValue->value,
                    'value' => 1,
                ]),
                'expressionLocation' => new ExpressionLocation([
                    'start' => 1,
                    'offset' => 1,
                ]),
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                    'topStackFrame' => new StackFrame([
                        'methodName' => 'methodName',
                        'lineNumber' => 1,
                        'scopes' => [
                            new Scope([
                                'variables' => [],
                            ]),
                            new Scope([
                                'variables' => [],
                            ]),
                        ],
                    ]),
                ]),
                'stdout' => 'stdout',
            ]),
            new TraceResponse([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'returnValue' => new DebugVariableValueZero([
                    'type' => DebugVariableValueZeroType::IntegerValue->value,
                    'value' => 1,
                ]),
                'expressionLocation' => new ExpressionLocation([
                    'start' => 1,
                    'offset' => 1,
                ]),
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                    'topStackFrame' => new StackFrame([
                        'methodName' => 'methodName',
                        'lineNumber' => 1,
                        'scopes' => [
                            new Scope([
                                'variables' => [],
                            ]),
                            new Scope([
                                'variables' => [],
                            ]),
                        ],
                    ]),
                ]),
                'stdout' => 'stdout',
            ]),
        ],
    ]),
);
