<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\GetUsersRequest;
use DateTime;
use Seed\User\Types\User;
use Seed\User\Types\NestedUser;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->user->getUsername(
    new GetUsersRequest([
        'limit' => 1,
        'id' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
        'date' => new DateTime('2023-01-15'),
        'deadline' => new DateTime('2024-01-15T09:30:00Z'),
        'bytes' => 'SGVsbG8gd29ybGQh',
        'user' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
        'userList' => [
            new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
            new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
        ],
        'optionalDeadline' => new DateTime('2024-01-15T09:30:00Z'),
        'keyValue' => [
            'keyValue' => 'keyValue',
        ],
        'optionalString' => 'optionalString',
        'nestedUser' => new NestedUser([
            'name' => 'name',
            'user' => new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
        ]),
        'optionalUser' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
        'excludeUser' => [
            new User([
                'name' => 'name',
                'tags' => [
                    'tags',
                    'tags',
                ],
            ]),
        ],
        'filter' => [
            'filter',
        ],
        'longParam' => 1000000,
        'bigIntParam' => '1000000',
    ]),
);
