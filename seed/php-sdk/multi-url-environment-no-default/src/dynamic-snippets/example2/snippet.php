<?php

namespace Example;

use Seed\SeedClient;
use Seed\S3\Requests\S3GetPresignedUrlRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->s3->getpresignedurl(
    new S3GetPresignedUrlRequest([
        's3Key' => 's3Key',
    ]),
);
