<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\StoreTracedTestCaseRequest;
use Seed\Submission\Types\TestCaseResultWithStdout;
use Seed\Submission\Types\TestCaseResult;
use Seed\Commons\Types\VariableValue;
use Seed\Submission\Types\ActualResult;
use Seed\Submission\Types\TraceResponse;
use Seed\Commons\Types\DebugVariableValue;
use Seed\Submission\Types\ExpressionLocation;
use Seed\Submission\Types\StackInformation;
use Seed\Submission\Types\StackFrame;
use Seed\Submission\Types\Scope;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->admin->storeTracedTestCase(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    'testCaseId',
    new StoreTracedTestCaseRequest([
        'result' => new TestCaseResultWithStdout([
            'result' => new TestCaseResult([
                'expectedResult' => VariableValue::integerValue(),
                'actualResult' => ActualResult::value(),
                'passed' => true,
            ]),
            'stdout' => 'stdout',
        ]),
        'traceResponses' => [
            new TraceResponse([
                'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'lineNumber' => 1,
                'returnValue' => DebugVariableValue::integerValue(),
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
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                        ],
                    ]),
                ]),
                'stdout' => 'stdout',
            ]),
            new TraceResponse([
                'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'lineNumber' => 1,
                'returnValue' => DebugVariableValue::integerValue(),
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
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                            new Scope([
                                'variables' => [
                                    'variables' => DebugVariableValue::integerValue(),
                                ],
                            ]),
                        ],
                    ]),
                ]),
                'stdout' => 'stdout',
            ]),
        ],
    ]),
);
