<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullableoptional\Requests\NullableOptionalListUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullableoptional->listusers(
    new NullableOptionalListUsersRequest([]),
);
