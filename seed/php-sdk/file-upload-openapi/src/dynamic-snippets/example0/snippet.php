<?php

namespace Example;

use Seed\SeedClient;
use Seed\FileUploadExample\Requests\UploadFileRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->fileUploadExample->uploadFile(
    new UploadFileRequest([
        'name' => 'name',
    ]),
);
