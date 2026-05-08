<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\TypesObjectWithOptionalField;
use Seed\Types\TypesObjectWithRequiredField;
use Seed\Types\TypesObjectWithMapOfMap;
use Seed\Types\TypesNestedObjectWithOptionalField;
use Seed\Endpoints\Object\Requests\GetAndReturnNestedWithRequiredFieldObjectRequest;
use Seed\Types\TypesNestedObjectWithRequiredField;
use Seed\Types\TypesObjectWithUnknownField;
use Seed\Types\TypesObjectWithDocumentedUnknownType;
use Seed\Types\TypesObjectWithDatetimeLikeString;
use DateTime;

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
            new TypesObjectWithOptionalField([]),
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
            new TypesObjectWithRequiredField([
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
            new TypesObjectWithMapOfMap([
                'map' => [
                    'key' => [
                        'key' => 'value',
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
            new TypesNestedObjectWithOptionalField([]),
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
            new GetAndReturnNestedWithRequiredFieldObjectRequest([
                'body' => new TypesNestedObjectWithRequiredField([
                    'string' => 'string',
                    'nestedObject' => new TypesObjectWithOptionalField([]),
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
                new TypesNestedObjectWithRequiredField([
                    'string' => 'string',
                    'nestedObject' => new TypesObjectWithOptionalField([]),
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
            new TypesObjectWithUnknownField([
                'unknown' => [
                    'key' => "value",
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
            new TypesObjectWithDocumentedUnknownType([
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
            [],
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
            new TypesObjectWithDatetimeLikeString([
                'datetimeLikeString' => 'datetimeLikeString',
                'actualDatetime' => new DateTime('2024-01-15T09:30:00Z'),
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
