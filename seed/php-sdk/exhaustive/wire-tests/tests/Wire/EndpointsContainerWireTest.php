<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\TypesObjectWithRequiredField;

class EndpointsContainerWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testEndpointsContainerGetAndReturnListOfPrimitives(): void {
        $testId = 'endpoints_container.endpoints_container_get_and_return_list_of_primitives.0';
        $this->client->endpointsContainer->endpointsContainerGetAndReturnListOfPrimitives(
            [
                'string',
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_container.endpoints_container_get_and_return_list_of_primitives.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/container/list-of-primitives",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsContainerGetAndReturnListOfObjects(): void {
        $testId = 'endpoints_container.endpoints_container_get_and_return_list_of_objects.0';
        $this->client->endpointsContainer->endpointsContainerGetAndReturnListOfObjects(
            [
                new TypesObjectWithRequiredField([
                    'string' => 'string',
                ]),
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_container.endpoints_container_get_and_return_list_of_objects.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/container/list-of-objects",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsContainerGetAndReturnSetOfPrimitives(): void {
        $testId = 'endpoints_container.endpoints_container_get_and_return_set_of_primitives.0';
        $this->client->endpointsContainer->endpointsContainerGetAndReturnSetOfPrimitives(
            [
                'string',
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_container.endpoints_container_get_and_return_set_of_primitives.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/container/set-of-primitives",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsContainerGetAndReturnSetOfObjects(): void {
        $testId = 'endpoints_container.endpoints_container_get_and_return_set_of_objects.0';
        $this->client->endpointsContainer->endpointsContainerGetAndReturnSetOfObjects(
            [
                new TypesObjectWithRequiredField([
                    'string' => 'string',
                ]),
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_container.endpoints_container_get_and_return_set_of_objects.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/container/set-of-objects",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsContainerGetAndReturnMapPrimToPrim(): void {
        $testId = 'endpoints_container.endpoints_container_get_and_return_map_prim_to_prim.0';
        $this->client->endpointsContainer->endpointsContainerGetAndReturnMapPrimToPrim(
            [
                'key' => 'value',
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_container.endpoints_container_get_and_return_map_prim_to_prim.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/container/map-prim-to-prim",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsContainerGetAndReturnMapOfPrimToObject(): void {
        $testId = 'endpoints_container.endpoints_container_get_and_return_map_of_prim_to_object.0';
        $this->client->endpointsContainer->endpointsContainerGetAndReturnMapOfPrimToObject(
            [
                'key' => new TypesObjectWithRequiredField([
                    'string' => 'string',
                ]),
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_container.endpoints_container_get_and_return_map_of_prim_to_object.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/container/map-prim-to-object",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(): void {
        $testId = 'endpoints_container.endpoints_container_get_and_return_map_of_prim_to_undiscriminated_union.0';
        $this->client->endpointsContainer->endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(
            [
                'key' => 1.1,
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_container.endpoints_container_get_and_return_map_of_prim_to_undiscriminated_union.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/container/map-prim-to-union",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsContainerGetAndReturnOptional(): void {
        $testId = 'endpoints_container.endpoints_container_get_and_return_optional.0';
        $this->client->endpointsContainer->endpointsContainerGetAndReturnOptional(
            new TypesObjectWithRequiredField([
                'string' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_container.endpoints_container_get_and_return_optional.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/container/opt-objects",
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
