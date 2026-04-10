<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\TypesObjectWithOptionalField;
use Seed\Types\TypesObjectWithRequiredField;
use Seed\Types\TypesObjectWithMapOfMap;
use Seed\Types\TypesNestedObjectWithOptionalField;
use Seed\EndpointsObject\Requests\EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest;
use Seed\Types\TypesNestedObjectWithRequiredField;
use Seed\Types\TypesObjectWithUnknownField;
use Seed\Types\TypesObjectWithDocumentedUnknownType;
use Seed\Types\TypesObjectWithMixedRequiredAndOptionalFields;
use Seed\Types\TypesObjectWithRequiredNestedObject;
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
    public function testEndpointsObjectGetAndReturnWithOptionalField(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_with_optional_field.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnWithOptionalField(
            new TypesObjectWithOptionalField([]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_with_optional_field.0',
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
    public function testEndpointsObjectGetAndReturnWithRequiredField(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_with_required_field.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnWithRequiredField(
            new TypesObjectWithRequiredField([
                'string' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_with_required_field.0',
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
    public function testEndpointsObjectGetAndReturnWithMapOfMap(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_with_map_of_map.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnWithMapOfMap(
            new TypesObjectWithMapOfMap([
                'map' => [
                    'key' => [
                        'key' => 'value',
                    ],
                ],
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_with_map_of_map.0',
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
    public function testEndpointsObjectGetAndReturnNestedWithOptionalField(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_nested_with_optional_field.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnNestedWithOptionalField(
            new TypesNestedObjectWithOptionalField([]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_nested_with_optional_field.0',
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
    public function testEndpointsObjectGetAndReturnNestedWithRequiredField(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_nested_with_required_field.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnNestedWithRequiredField(
            'string',
            new EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest([
                'body' => new TypesNestedObjectWithRequiredField([
                    'string' => 'string',
                    'nestedObject' => new TypesObjectWithOptionalField([]),
                ]),
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_nested_with_required_field.0',
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
    public function testEndpointsObjectGetAndReturnNestedWithRequiredFieldAsList(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_nested_with_required_field_as_list.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnNestedWithRequiredFieldAsList(
            [
                new TypesNestedObjectWithRequiredField([
                    'string' => 'string',
                    'nestedObject' => new TypesObjectWithOptionalField([]),
                ]),
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_nested_with_required_field_as_list.0',
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
    public function testEndpointsObjectGetAndReturnWithUnknownField(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_with_unknown_field.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnWithUnknownField(
            new TypesObjectWithUnknownField([
                'unknown' => [
                    'key' => "value",
                ],
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_with_unknown_field.0',
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
    public function testEndpointsObjectGetAndReturnWithDocumentedUnknownType(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_with_documented_unknown_type.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnWithDocumentedUnknownType(
            new TypesObjectWithDocumentedUnknownType([
                'documentedUnknownType' => [
                    'key' => "value",
                ],
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_with_documented_unknown_type.0',
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
    public function testEndpointsObjectGetAndReturnMapOfDocumentedUnknownType(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_map_of_documented_unknown_type.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnMapOfDocumentedUnknownType(
            [],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_map_of_documented_unknown_type.0',
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
    public function testEndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_with_mixed_required_and_optional_fields.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(
            new TypesObjectWithMixedRequiredAndOptionalFields([
                'requiredString' => 'requiredString',
                'requiredInteger' => 1,
                'requiredLong' => 1000000,
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_with_mixed_required_and_optional_fields.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-with-mixed-required-and-optional-fields",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsObjectGetAndReturnWithRequiredNestedObject(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_with_required_nested_object.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnWithRequiredNestedObject(
            new TypesObjectWithRequiredNestedObject([
                'requiredString' => 'requiredString',
                'requiredObject' => new TypesNestedObjectWithRequiredField([
                    'string' => 'string',
                    'nestedObject' => new TypesObjectWithOptionalField([]),
                ]),
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_with_required_nested_object.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/object/get-and-return-with-required-nested-object",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsObjectGetAndReturnWithDatetimeLikeString(): void {
        $testId = 'endpoints_object.endpoints_object_get_and_return_with_datetime_like_string.0';
        $this->client->endpointsObject->endpointsObjectGetAndReturnWithDatetimeLikeString(
            new TypesObjectWithDatetimeLikeString([
                'datetimeLikeString' => 'datetimeLikeString',
                'actualDatetime' => new DateTime('2024-01-15T09:30:00Z'),
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_object.endpoints_object_get_and_return_with_datetime_like_string.0',
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
