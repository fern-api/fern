<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\OptionalMergePatchRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->optionalMergePatchTest(
    new OptionalMergePatchRequest([
        'requiredField' => 'requiredField',
        'optionalString' => 'optionalString',
        'optionalInteger' => 1,
        'optionalBoolean' => true,
        'nullableString' => 'nullableString',
    ]),
);
