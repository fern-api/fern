<?php

namespace Example;

use Seed\SeedClient;
use Seed\FileUploadExample\Requests\UploadFileRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->fileUploadExample->uploadFile(
    new UploadFileRequest([
        'file' => File::createFromString("example_file", "example_file"),
        'name' => 'name',
    ]),
);
