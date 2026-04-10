<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceWithJsonPropertyRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->withjsonproperty(
    new ServiceWithJsonPropertyRequest([
        'file' => File::createFromString("example_file", "example_file"),
    ]),
);
