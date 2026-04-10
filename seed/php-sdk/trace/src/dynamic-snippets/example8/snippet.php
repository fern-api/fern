<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\AdminSendWorkspaceSubmissionUpdateRequest;
use Seed\Types\WorkspaceSubmissionUpdate;
use DateTime;
use Seed\Types\WorkspaceSubmissionUpdateInfoZero;
use Seed\Types\WorkspaceSubmissionUpdateInfoZeroType;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->admin->sendworkspacesubmissionupdate(
    'submissionId',
    new AdminSendWorkspaceSubmissionUpdateRequest([
        'body' => new WorkspaceSubmissionUpdate([
            'updateTime' => new DateTime('2024-01-15T09:30:00Z'),
            'updateInfo' => new WorkspaceSubmissionUpdateInfoZero([
                'type' => WorkspaceSubmissionUpdateInfoZeroType::Running->value,
            ]),
        ]),
    ]),
);
