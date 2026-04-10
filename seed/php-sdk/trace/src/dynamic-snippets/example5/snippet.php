<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\AdminSendTestSubmissionUpdateRequest;
use Seed\Types\TestSubmissionUpdate;
use DateTime;
use Seed\Types\TestSubmissionUpdateInfoZero;
use Seed\Types\TestSubmissionUpdateInfoZeroType;
use Seed\Types\RunningSubmissionState;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->admin->sendtestsubmissionupdate(
    'submissionId',
    new AdminSendTestSubmissionUpdateRequest([
        'body' => new TestSubmissionUpdate([
            'updateTime' => new DateTime('2024-01-15T09:30:00Z'),
            'updateInfo' => new TestSubmissionUpdateInfoZero([
                'type' => TestSubmissionUpdateInfoZeroType::Running->value,
                'value' => RunningSubmissionState::QueueingSubmission->value,
            ]),
        ]),
    ]),
);
