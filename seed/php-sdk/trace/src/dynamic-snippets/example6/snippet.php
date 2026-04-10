<?php

namespace Example;

use Seed\SeedClient;
use Seed\Submission\Types\TraceResponseV2;
use Seed\Submission\Types\TracedFile;
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
$client->admin->storeTracedTestCaseV2(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    'testCaseId',
    [
        new TraceResponseV2([
            'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'lineNumber' => 1,
            'file' => new TracedFile([
                'filename' => 'filename',
                'directory' => 'directory',
            ]),
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
        new TraceResponseV2([
            'submissionId' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'lineNumber' => 1,
            'file' => new TracedFile([
                'filename' => 'filename',
                'directory' => 'directory',
            ]),
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
);
