<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceWithFormEncodedContainersRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->withformencodedcontainers(
    new ServiceWithFormEncodedContainersRequest([
        'file' => File::createFromString("example_file", "example_file"),
        'fileList' => File::createFromString("example_file_list", "example_file_list"),
        'maybeFile' => File::createFromString("example_maybe_file", "example_maybe_file"),
        'maybeFileList' => File::createFromString("example_maybe_file_list", "example_maybe_file_list"),
    ]),
);
