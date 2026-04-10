<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\NullableOptionalUpdateComplexProfileRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->updatecomplexprofile(
    'profileId',
    new NullableOptionalUpdateComplexProfileRequest([]),
);
