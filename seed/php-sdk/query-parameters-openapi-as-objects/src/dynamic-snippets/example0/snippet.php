<?php

namespace Example;

use Seed\SeedClient;
use Seed\Requests\SearchRequest;
use DateTime;
use Seed\Types\User;
use Seed\Types\NestedUser;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->search(
    new SearchRequest([
        'limit' => 1,
        'id' => 'id',
        'date' => new DateTime('2023-01-15'),
        'deadline' => new DateTime('2024-01-15T09:30:00Z'),
        'bytes' => 'bytes',
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
        'neighbor' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
        'neighborRequired' => new User([
            'name' => 'name',
            'tags' => [
                'tags',
                'tags',
            ],
        ]),
    ]),
);
