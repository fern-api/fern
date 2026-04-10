<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceWithInlineTypeRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->withinlinetype(
    new ServiceWithInlineTypeRequest([
        'file' => File::createFromString("example_file", "example_file"),
    ]),
);
