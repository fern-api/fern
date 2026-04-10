<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\ServiceJustFileWithOptionalQueryParamsRequest;
use Seed\Utils\File;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->justfilewithoptionalqueryparams(
    new ServiceJustFileWithOptionalQueryParamsRequest([
        'file' => File::createFromString("example_file", "example_file"),
    ]),
);
