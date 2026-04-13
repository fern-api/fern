<?php

namespace Example;

use Seed\SeedClient;
use Seed\Nullable\Requests\NullableCreateUserRequest;
use Seed\Types\Metadata;
use DateTime;
use Seed\Types\Status;
use Seed\Types\StatusActive;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->nullable->createuser(
    new NullableCreateUserRequest([
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
            'status' => Status::active(new StatusActive([])),
            'values' => [
                'values' => 'values',
            ],
        ]),
        'avatar' => 'avatar',
    ]),
);
