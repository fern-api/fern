<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullable\Requests\NullableGetUsersRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullable->getusers(
    new NullableGetUsersRequest([]),
);
