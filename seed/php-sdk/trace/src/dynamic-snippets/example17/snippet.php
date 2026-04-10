<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\AdminStoreTracedWorkspaceV2Request;
use Seed\Types\TraceResponseV2;
use Seed\Types\TracedFile;
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
$client->admin->storetracedworkspacev2(
    'submissionId',
    new AdminStoreTracedWorkspaceV2Request([
        'body' => [
            new TraceResponseV2([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'file' => new TracedFile([
                    'filename' => 'filename',
                    'directory' => 'directory',
                ]),
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
                                'variables' => [
                                    'variables' => new DebugVariableValueZero([
                                        'type' => DebugVariableValueZeroType::IntegerValue->value,
                                    ]),
                                ],
                            ]),
                            new Scope([
                                'variables' => [
                                    'variables' => new DebugVariableValueZero([
                                        'type' => DebugVariableValueZeroType::IntegerValue->value,
                                    ]),
                                ],
                            ]),
                        ],
                    ]),
                ]),
                'stdout' => 'stdout',
            ]),
            new TraceResponseV2([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'file' => new TracedFile([
                    'filename' => 'filename',
                    'directory' => 'directory',
                ]),
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
                                'variables' => [
                                    'variables' => new DebugVariableValueZero([
                                        'type' => DebugVariableValueZeroType::IntegerValue->value,
                                    ]),
                                ],
                            ]),
                            new Scope([
                                'variables' => [
                                    'variables' => new DebugVariableValueZero([
                                        'type' => DebugVariableValueZeroType::IntegerValue->value,
                                    ]),
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
