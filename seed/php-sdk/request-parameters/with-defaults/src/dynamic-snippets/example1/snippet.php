<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\CreateUsernameReferencedRequest;
use Seed\User\Types\CreateUsernameBody;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->createUsernameWithReferencedType(
    new CreateUsernameReferencedRequest([
        'tags' => [
            'tags',
            'tags',
        ],
        'body' => new CreateUsernameBody([
            'username' => 'username',
            'password' => 'password',
            'name' => 'test',
        ]),
    ]),
);
