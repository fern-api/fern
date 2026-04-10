<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullable\Requests\DeleteUserRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullable->deleteUser(
    new DeleteUserRequest([
        'username' => 'xy',
    ]),
);
