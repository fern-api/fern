<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceWithFormEncodingRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->withformencoding(
    new ServiceWithFormEncodingRequest([
        'file' => File::createFromString("example_file", "example_file"),
    ]),
);
