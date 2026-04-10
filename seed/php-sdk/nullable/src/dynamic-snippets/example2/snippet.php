<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullable\Requests\NullableCreateUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullable->createuser(
    new NullableCreateUserRequest([
        'username' => 'username',
    ]),
);
