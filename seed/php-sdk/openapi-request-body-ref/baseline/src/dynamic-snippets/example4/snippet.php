<?php

namespace Example;

use Seed\SeedClient;
use Seed\Catalog\Requests\CreateCatalogImageBody;
use Seed\Utils\File;
use Seed\Types\CreateCatalogImageRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->catalog->createCatalogImage(
    new CreateCatalogImageBody([
        'imageFile' => File::createFromString("example_image_file", "example_image_file"),
        'request' => new CreateCatalogImageRequest([
            'catalogObjectId' => 'catalog_object_id',
        ]),
    ]),
);
