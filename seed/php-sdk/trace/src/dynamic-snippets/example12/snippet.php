<?php

namespace Example;

use Seed\SeedClient;
use Seed\Admin\Requests\AdminStoreTracedTestCaseV2Request;
use Seed\Types\TraceResponseV2;
use Seed\Types\TracedFile;
use Seed\Types\StackInformation;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->admin->storetracedtestcasev2(
    'submissionId',
    'testCaseId',
    new AdminStoreTracedTestCaseV2Request([
        'body' => [
            new TraceResponseV2([
                'submissionId' => 'submissionId',
                'lineNumber' => 1,
                'file' => new TracedFile([
                    'filename' => 'filename',
                    'directory' => 'directory',
                ]),
                'stack' => new StackInformation([
                    'numStackFrames' => 1,
                ]),
            ]),
        ],
    ]),
);
