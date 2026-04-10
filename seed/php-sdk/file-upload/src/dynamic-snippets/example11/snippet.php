<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceWithLiteralAndEnumTypesRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->withliteralandenumtypes(
    new ServiceWithLiteralAndEnumTypesRequest([
        'file' => File::createFromString("example_file", "example_file"),
    ]),
);
