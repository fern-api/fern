<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Types\BigEntity;
use Seed\Types\Types\Actor;
use Seed\Types\Types\ExtendedMovie;
use Seed\Types\Types\Entity;
use Seed\Types\BasicType;
use Seed\Types\Types\Metadata;
use Seed\Commons\Types\Types\EventInfo;
use Seed\Commons\Types\Types\Data;
use Seed\Types\Types\Migration;
use Seed\Types\Types\MigrationStatus;
use Seed\Types\Types\Exception;
use Seed\Types\Types\ExceptionInfo;
use Seed\Types\Types\Test;
use Seed\Types\Types\Node;
use Seed\Types\Types\Tree;
use Seed\Types\Types\Directory;
use Seed\Types\Types\File;
use Seed\Types\Types\Moment;
use DateTime;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->createBigEntity(
    new BigEntity([
        'castMember' => new Actor([
            'name' => 'name',
            'id' => 'id',
        ]),
        'extendedMovie' => new ExtendedMovie([
            'cast' => [
                'cast',
                'cast',
            ],
            'id' => 'id',
            'prequel' => 'prequel',
            'title' => 'title',
            'from' => 'from',
            'rating' => 1.1,
            'type' => 'movie',
            'tag' => 'tag',
            'book' => 'book',
            'metadata' => [
                'metadata' => [
                    'key' => "value",
                ],
            ],
            'revenue' => 1000000,
        ]),
        'entity' => new Entity([
            'type' => BasicType::Primitive->value,
            'name' => 'name',
        ]),
        'metadata' => Metadata::html([
            'extra' => 'extra',
        ], [
            'tags',
        ]),
        'commonMetadata' => new \Seed\Commons\Types\Types\Metadata([
            'id' => 'id',
            'data' => [
                'data' => 'data',
            ],
            'jsonString' => 'jsonString',
        ]),
        'eventInfo' => EventInfo::metadata(new \Seed\Commons\Types\Types\Metadata([
            'id' => 'id',
            'data' => [
                'data' => 'data',
            ],
            'jsonString' => 'jsonString',
        ])),
        'data' => Data::string(),
        'migration' => new Migration([
            'name' => 'name',
            'status' => MigrationStatus::Running->value,
        ]),
        'exception' => Exception::generic(new ExceptionInfo([
            'exceptionType' => 'exceptionType',
            'exceptionMessage' => 'exceptionMessage',
            'exceptionStacktrace' => 'exceptionStacktrace',
        ])),
        'test' => Test::and_(),
        'node' => new Node([
            'name' => 'name',
            'nodes' => [
                new Node([
                    'name' => 'name',
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                    ],
                    'trees' => [
                        new Tree([
                            'nodes' => [],
                        ]),
                        new Tree([
                            'nodes' => [],
                        ]),
                    ],
                ]),
                new Node([
                    'name' => 'name',
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                    ],
                    'trees' => [
                        new Tree([
                            'nodes' => [],
                        ]),
                        new Tree([
                            'nodes' => [],
                        ]),
                    ],
                ]),
            ],
            'trees' => [
                new Tree([
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                    ],
                ]),
                new Tree([
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                        new Node([
                            'name' => 'name',
                            'nodes' => [],
                            'trees' => [],
                        ]),
                    ],
                ]),
            ],
        ]),
        'directory' => new Directory([
            'name' => 'name',
            'files' => [
                new File([
                    'name' => 'name',
                    'contents' => 'contents',
                ]),
                new File([
                    'name' => 'name',
                    'contents' => 'contents',
                ]),
            ],
            'directories' => [
                new Directory([
                    'name' => 'name',
                    'files' => [
                        new File([
                            'name' => 'name',
                            'contents' => 'contents',
                        ]),
                        new File([
                            'name' => 'name',
                            'contents' => 'contents',
                        ]),
                    ],
                    'directories' => [
                        new Directory([
                            'name' => 'name',
                            'files' => [],
                            'directories' => [],
                        ]),
                        new Directory([
                            'name' => 'name',
                            'files' => [],
                            'directories' => [],
                        ]),
                    ],
                ]),
                new Directory([
                    'name' => 'name',
                    'files' => [
                        new File([
                            'name' => 'name',
                            'contents' => 'contents',
                        ]),
                        new File([
                            'name' => 'name',
                            'contents' => 'contents',
                        ]),
                    ],
                    'directories' => [
                        new Directory([
                            'name' => 'name',
                            'files' => [],
                            'directories' => [],
                        ]),
                        new Directory([
                            'name' => 'name',
                            'files' => [],
                            'directories' => [],
                        ]),
                    ],
                ]),
            ],
        ]),
        'moment' => new Moment([
            'id' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
            'date' => new DateTime('2023-01-15'),
            'datetime' => new DateTime('2024-01-15T09:30:00Z'),
        ]),
    ]),
);
