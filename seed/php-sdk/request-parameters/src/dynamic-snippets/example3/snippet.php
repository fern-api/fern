<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Types\CreateUsernameBodyOptionalProperties;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createUsernameOptional(
    new CreateUsernameBodyOptionalProperties([
        'username' => 'username',
        'password' => 'password',
        'name' => 'test',
    ]),
);
