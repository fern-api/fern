<?php

namespace Example;

use Seed\SeedClient;
use Seed\File\Service\Requests\GetFileRequest;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->file->service->getFile(
    'filename',
    new GetFileRequest([
        'xFileApiVersion' => 'X-File-API-Version',
    ]),
);
