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
use Seed\Types\Object\Types\ObjectWithUnknownField;
use Seed\Types\Object\Types\ObjectWithDocumentedUnknownType;
use Seed\Types\Object\Types\ObjectWithDatetimeLikeString;

class EndpointsObjectWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetAndReturnWithOptionalField(): void {
        $testId = 'endpoints.object.get_and_return_with_optional_field.0';
        $this->client->endpoints->object->getAndReturnWithOptionalField(
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
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_with_optional_field.0',
                ],
            ],
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
        $this->client->endpoints->object->getAndReturnWithRequiredField(
            new ObjectWithRequiredField([
                'string' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_with_required_field.0',
                ],
            ],
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
        $this->client->endpoints->object->getAndReturnWithMapOfMap(
            new ObjectWithMapOfMap([
                'map' => [
                    'map' => [
                        'map' => 'map',
                    ],
                ],
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_with_map_of_map.0',
                ],
            ],
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
        $this->client->endpoints->object->getAndReturnNestedWithOptionalField(
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
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_nested_with_optional_field.0',
                ],
            ],
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
        $this->client->endpoints->object->getAndReturnNestedWithRequiredField(
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
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_nested_with_required_field.0',
                ],
            ],
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
        $this->client->endpoints->object->getAndReturnNestedWithRequiredFieldAsList(
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
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_nested_with_required_field_as_list.0',
                ],
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

    /**
     */
    public function testGetAndReturnWithUnknownField(): void {
        $testId = 'endpoints.object.get_and_return_with_unknown_field.0';
        $this->client->endpoints->object->getAndReturnWithUnknownField(
            new ObjectWithUnknownField([
                'unknown' => [
                    '$ref' => "https://example.com/schema",
                ],
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_with_unknown_field.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-with-unknown-field",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnWithDocumentedUnknownType(): void {
        $testId = 'endpoints.object.get_and_return_with_documented_unknown_type.0';
        $this->client->endpoints->object->getAndReturnWithDocumentedUnknownType(
            new ObjectWithDocumentedUnknownType([
                'documentedUnknownType' => [
                    'key' => "value",
                ],
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_with_documented_unknown_type.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-with-documented-unknown-type",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnMapOfDocumentedUnknownType(): void {
        $testId = 'endpoints.object.get_and_return_map_of_documented_unknown_type.0';
        $this->client->endpoints->object->getAndReturnMapOfDocumentedUnknownType(
            [
                'string' => [
                    'key' => "value",
                ],
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_map_of_documented_unknown_type.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-map-of-documented-unknown-type",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnWithDatetimeLikeString(): void {
        $testId = 'endpoints.object.get_and_return_with_datetime_like_string.0';
        $this->client->endpoints->object->getAndReturnWithDatetimeLikeString(
            new ObjectWithDatetimeLikeString([
                'datetimeLikeString' => '2023-08-31T14:15:22Z',
                'actualDatetime' => new DateTime('2023-08-31T14:15:22Z'),
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.object.get_and_return_with_datetime_like_string.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-with-datetime-like-string",
            null,
            1
        );
    }

    /**
     */
    protected function setUp(): void {
        parent::setUp();
        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $this->client = new SeedClient(
            token: 'test-token',
        options: [
            'baseUrl' => $wiremockUrl,
        ],
        );
    }
}
