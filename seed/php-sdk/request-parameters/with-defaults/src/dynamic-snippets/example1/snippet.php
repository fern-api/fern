<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\CreateUsernameBody;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createusernamewithreferencedtype(
    new CreateUsernameBody([
        'tags' => [
            'tags',
        ],
        'username' => 'username',
        'password' => 'password',
        'name' => 'name',
    ]),
);
