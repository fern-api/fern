<?php

namespace Example;

use Seed\SeedClient;
use Seed\Environments;
use Seed\S3\Requests\GetPresignedUrlRequest;

$client = new SeedClient(
    token: '<token>',
    environment: Environments::Production(),
);
$client->s3->getPresignedUrl(
    new GetPresignedUrlRequest([
        's3Key' => 's3Key',
    ]),
);
