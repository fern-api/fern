<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\AdminStoreTracedWorkspaceRequest;
use Seed\Types\WorkspaceRunDetails;
use Seed\Types\ExceptionV2Zero;
use Seed\Types\ExceptionV2ZeroType;
use Seed\Types\ExceptionInfo;
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
$client->admin->storetracedworkspace(
    'submissionId',
    new AdminStoreTracedWorkspaceRequest([
        'workspaceRunDetails' => new WorkspaceRunDetails([
            'exceptionV2' => new ExceptionV2Zero([
                'type' => ExceptionV2ZeroType::Generic->value,
                'exceptionType' => 'exceptionType',
                'exceptionMessage' => 'exceptionMessage',
                'exceptionStacktrace' => 'exceptionStacktrace',
            ]),
            'exception' => new ExceptionInfo([
                'exceptionType' => 'exceptionType',
                'exceptionMessage' => 'exceptionMessage',
                'exceptionStacktrace' => 'exceptionStacktrace',
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
