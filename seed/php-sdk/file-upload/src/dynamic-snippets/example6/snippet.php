<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceOptionalArgsRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->optionalargs(
    new ServiceOptionalArgsRequest([
        'imageFile' => File::createFromString("example_image_file", "example_image_file"),
    ]),
);
