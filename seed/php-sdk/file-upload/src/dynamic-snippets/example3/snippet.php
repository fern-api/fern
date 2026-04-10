<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceWithContentTypeRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->withcontenttype(
    new ServiceWithContentTypeRequest([
        'file' => File::createFromString("example_file", "example_file"),
    ]),
);
