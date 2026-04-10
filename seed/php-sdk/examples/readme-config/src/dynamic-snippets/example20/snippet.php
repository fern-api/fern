<?php

namespace Example;

use Seed\SeedClient;
use Seed\Service\Requests\BigEntity;
use Seed\Types\Actor;
use Seed\Types\ExtendedMovie;
use Seed\Types\MovieType;
use Seed\Types\Entity;
use Seed\Types\BasicType;
use Seed\Types\Metadata;
use Seed\Types\MetadataHtml;
use Seed\Types\CommonsMetadata;
use Seed\Types\CommonsEventInfoZero;
use Seed\Types\CommonsEventInfoZeroType;
use Seed\Types\CommonsData;
use Seed\Types\CommonsDataString;
use Seed\Types\Migration;
use Seed\Types\MigrationStatus;
use Seed\Types\ExceptionZero;
use Seed\Types\ExceptionZeroType;
use Seed\Types\Test;
use Seed\Types\TestAnd;
use Seed\Types\Node;
use Seed\Types\Tree;
use Seed\Types\Directory;
use Seed\Types\File;
use Seed\Types\Moment;
use DateTime;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->service->createbigentity(
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
            'type' => MovieType::Movie->value,
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
            'tags',
        ], new MetadataHtml([
            'value' => 'value',
        ])),
        'commonMetadata' => new CommonsMetadata([
            'id' => 'id',
            'data' => [
                'data' => 'data',
            ],
            'jsonString' => 'jsonString',
        ]),
        'eventInfo' => new CommonsEventInfoZero([
            'type' => CommonsEventInfoZeroType::Metadata->value,
            'id' => 'id',
            'data' => [
                'data' => 'data',
            ],
            'jsonString' => 'jsonString',
        ]),
        'data' => CommonsData::string(new CommonsDataString([
            'value' => 'value',
        ])),
        'migration' => new Migration([
            'name' => 'name',
            'status' => MigrationStatus::Running->value,
        ]),
        'exception' => new ExceptionZero([
            'type' => ExceptionZeroType::Generic->value,
            'exceptionType' => 'exceptionType',
            'exceptionMessage' => 'exceptionMessage',
            'exceptionStacktrace' => 'exceptionStacktrace',
        ]),
        'test' => Test::and_(new TestAnd([
            'value' => true,
        ])),
        'node' => new Node([
            'name' => 'name',
            'nodes' => [
                new Node([
                    'name' => 'name',
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                        ]),
                        new Node([
                            'name' => 'name',
                        ]),
                    ],
                    'trees' => [
                        new Tree([]),
                        new Tree([]),
                    ],
                ]),
                new Node([
                    'name' => 'name',
                    'nodes' => [
                        new Node([
                            'name' => 'name',
                        ]),
                        new Node([
                            'name' => 'name',
                        ]),
                    ],
                    'trees' => [
                        new Tree([]),
                        new Tree([]),
                    ],
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
                    'files' => [],
                    'directories' => [
                        new Directory([
                            'name' => 'name',
                        ]),
                        new Directory([
                            'name' => 'name',
                        ]),
                    ],
                ]),
                new Directory([
                    'name' => 'name',
                    'files' => [],
                    'directories' => [
                        new Directory([
                            'name' => 'name',
                        ]),
                        new Directory([
                            'name' => 'name',
                        ]),
                    ],
                ]),
            ],
        ]),
        'moment' => new Moment([
            'id' => 'id',
            'date' => new DateTime('2023-01-15'),
            'datetime' => new DateTime('2024-01-15T09:30:00Z'),
        ]),
    ]),
);
