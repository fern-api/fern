<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\CreateUsernameBodyOptionalProperties;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createusernameoptional(
    new CreateUsernameBodyOptionalProperties([]),
);
