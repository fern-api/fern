<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\WithRefBodyRequest;
use Seed\Utils\File;
use Seed\Service\Types\MyObject;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->withRefBody(
    new WithRefBodyRequest([
        'imageFile' => File::createFromString("example_image_file", "example_image_file"),
        'request' => new MyObject([
            'foo' => 'bar',
        ]),
    ]),
);
