<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\OptionalArgsRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->optionalArgs(
    new OptionalArgsRequest([
        'imageFile' => File::createFromString("example_image_file", "example_image_file"),
    ]),
);
