<?php

namespace Example;

use Seed\SeedClient;
use Seed\Submission\Types\WorkspaceSubmissionUpdate;
use DateTime;
use Seed\Submission\Types\WorkspaceSubmissionUpdateInfo;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->admin->sendWorkspaceSubmissionUpdate(
    'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    new WorkspaceSubmissionUpdate([
        'updateTime' => new DateTime('2024-01-15T09:30:00Z'),
        'updateInfo' => WorkspaceSubmissionUpdateInfo::running(),
    ]),
);
