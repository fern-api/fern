<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullable\Requests\CreateUserRequest;
use Seed\Nullable\Types\Metadata;
use DateTime;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullable->createUser(
    new CreateUserRequest([
        'username' => 'username',
        'tags' => [
            'tags',
            'tags',
        ],
        'metadata' => new Metadata([
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
            'avatar' => 'avatar',
            'activated' => true,
        ]),
        'avatar' => 'avatar',
    ]),
);
