<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\AdminUpdateWorkspaceSubmissionStatusRequest;
use Seed\Types\WorkspaceSubmissionStatusZero;
use Seed\Types\WorkspaceSubmissionStatusZeroType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->admin->updateworkspacesubmissionstatus(
    'submissionId',
    new AdminUpdateWorkspaceSubmissionStatusRequest([
        'body' => new WorkspaceSubmissionStatusZero([
            'type' => WorkspaceSubmissionStatusZeroType::Stopped->value,
        ]),
    ]),
);
