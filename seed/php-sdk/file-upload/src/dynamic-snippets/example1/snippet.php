<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceJustFileRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->justfile(
    new ServiceJustFileRequest([
        'file' => File::createFromString("example_file", "example_file"),
    ]),
);
