<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullable\Requests\NullableDeleteUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullable->deleteuser(
    new NullableDeleteUserRequest([
        'username' => 'username',
    ]),
);
