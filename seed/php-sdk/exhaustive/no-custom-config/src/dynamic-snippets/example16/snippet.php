<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsContentType->endpointsContentTypePostJsonPatchContentType(
    new TypesObjectWithOptionalField([]),
);
