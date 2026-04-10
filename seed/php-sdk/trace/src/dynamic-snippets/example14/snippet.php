<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\AdminStoreTracedWorkspaceRequest;
use Seed\Types\WorkspaceRunDetails;
use Seed\Types\TraceResponse;
use Seed\Types\StackInformation;

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
