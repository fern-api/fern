<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\JustFileRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->justFile(
    new JustFileRequest([
        'file' => File::createFromString("example_file", "example_file"),
    ]),
);
