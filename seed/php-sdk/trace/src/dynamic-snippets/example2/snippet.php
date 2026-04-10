<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\AdminUpdateTestSubmissionStatusRequest;
use Seed\Types\TestSubmissionStatus;
use Seed\Types\TestSubmissionStatusStopped;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->admin->updatetestsubmissionstatus(
    'submissionId',
    new AdminUpdateTestSubmissionStatusRequest([
        'body' => TestSubmissionStatus::stopped(new TestSubmissionStatusStopped([])),
    ]),
);
