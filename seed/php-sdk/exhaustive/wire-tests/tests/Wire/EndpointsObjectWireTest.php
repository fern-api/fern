<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithOptionalField;
use DateTime;
use Seed\Types\Object\Types\ObjectWithRequiredField;
use Seed\Types\Object\Types\ObjectWithMapOfMap;
use Seed\Types\Object\Types\NestedObjectWithOptionalField;
use Seed\Types\Object\Types\NestedObjectWithRequiredField;

class EndpointsObjectWireTest extends WireMockTestCase
{

    /**
     */
    public function testGetAndReturnWithOptionalField(): void {
        $testId = 'endpoints.object.get_and_return_with_optional_field.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->object->getAndReturnWithOptionalField(
            new ObjectWithOptionalField([
                'string' => 'string',
                'integer' => 1,
                'long' => 1000000,
                'double' => 1.1,
                'bool' => true,
                'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                'date' => new DateTime('2023-01-15'),
                'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                'base64' => 'SGVsbG8gd29ybGQh',
                'list' => [
                    'list',
                    'list',
                ],
                'set' => [
                    'set',
                ],
                'map' => [
                    1 => 'map',
                ],
                'bigint' => '1000000',
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-with-optional-field",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnWithRequiredField(): void {
        $testId = 'endpoints.object.get_and_return_with_required_field.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->object->getAndReturnWithRequiredField(
            new ObjectWithRequiredField([
                'string' => 'string',
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-with-required-field",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnWithMapOfMap(): void {
        $testId = 'endpoints.object.get_and_return_with_map_of_map.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->object->getAndReturnWithMapOfMap(
            new ObjectWithMapOfMap([
                'map' => [
                    'map' => [
                        'map' => 'map',
                    ],
                ],
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-with-map-of-map",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnNestedWithOptionalField(): void {
        $testId = 'endpoints.object.get_and_return_nested_with_optional_field.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->object->getAndReturnNestedWithOptionalField(
            new NestedObjectWithOptionalField([
                'string' => 'string',
                'nestedObject' => new ObjectWithOptionalField([
                    'string' => 'string',
                    'integer' => 1,
                    'long' => 1000000,
                    'double' => 1.1,
                    'bool' => true,
                    'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                    'date' => new DateTime('2023-01-15'),
                    'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                    'base64' => 'SGVsbG8gd29ybGQh',
                    'list' => [
                        'list',
                        'list',
                    ],
                    'set' => [
                        'set',
                    ],
                    'map' => [
                        1 => 'map',
                    ],
                    'bigint' => '1000000',
                ]),
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-nested-with-optional-field",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnNestedWithRequiredField(): void {
        $testId = 'endpoints.object.get_and_return_nested_with_required_field.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->object->getAndReturnNestedWithRequiredField(
            'string',
            new NestedObjectWithRequiredField([
                'string' => 'string',
                'nestedObject' => new ObjectWithOptionalField([
                    'string' => 'string',
                    'integer' => 1,
                    'long' => 1000000,
                    'double' => 1.1,
                    'bool' => true,
                    'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                    'date' => new DateTime('2023-01-15'),
                    'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                    'base64' => 'SGVsbG8gd29ybGQh',
                    'list' => [
                        'list',
                        'list',
                    ],
                    'set' => [
                        'set',
                    ],
                    'map' => [
                        1 => 'map',
                    ],
                    'bigint' => '1000000',
                ]),
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-nested-with-required-field/string",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnNestedWithRequiredFieldAsList(): void {
        $testId = 'endpoints.object.get_and_return_nested_with_required_field_as_list.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->object->getAndReturnNestedWithRequiredFieldAsList(
            [
                new NestedObjectWithRequiredField([
                    'string' => 'string',
                    'nestedObject' => new ObjectWithOptionalField([
                        'string' => 'string',
                        'integer' => 1,
                        'long' => 1000000,
                        'double' => 1.1,
                        'bool' => true,
                        'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                        'date' => new DateTime('2023-01-15'),
                        'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                        'base64' => 'SGVsbG8gd29ybGQh',
                        'list' => [
                            'list',
                            'list',
                        ],
                        'set' => [
                            'set',
                        ],
                        'map' => [
                            1 => 'map',
                        ],
                        'bigint' => '1000000',
                    ]),
                ]),
                new NestedObjectWithRequiredField([
                    'string' => 'string',
                    'nestedObject' => new ObjectWithOptionalField([
                        'string' => 'string',
                        'integer' => 1,
                        'long' => 1000000,
                        'double' => 1.1,
                        'bool' => true,
                        'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                        'date' => new DateTime('2023-01-15'),
                        'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                        'base64' => 'SGVsbG8gd29ybGQh',
                        'list' => [
                            'list',
                            'list',
                        ],
                        'set' => [
                            'set',
                        ],
                        'map' => [
                            1 => 'map',
                        ],
                        'bigint' => '1000000',
                    ]),
                ]),
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-nested-with-required-field-list",
            null,
            1
        );
    }
}
