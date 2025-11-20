<?php

namespace Example;

use Seed\SeedClient;
use Seed\S3\Requests\GetPresignedUrlRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->s3->getPresignedUrl(
    new GetPresignedUrlRequest([
        's3Key' => 's3Key',
    ]),
);
