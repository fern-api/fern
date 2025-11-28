<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithRequiredField;

class EndpointsContainerWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetAndReturnListOfPrimitives(): void {
        $testId = 'endpoints.container.get_and_return_list_of_primitives.0';
        $this->client->endpoints->container->getAndReturnListOfPrimitives(
            [
                'string',
                'string',
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.container.get_and_return_list_of_primitives.0',
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
    public function testGetAndReturnListOfObjects(): void {
        $testId = 'endpoints.container.get_and_return_list_of_objects.0';
        $this->client->endpoints->container->getAndReturnListOfObjects(
            [
                new ObjectWithRequiredField([
                    'string' => 'string',
                ]),
                new ObjectWithRequiredField([
                    'string' => 'string',
                ]),
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.container.get_and_return_list_of_objects.0',
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
    public function testGetAndReturnSetOfPrimitives(): void {
        $testId = 'endpoints.container.get_and_return_set_of_primitives.0';
        $this->client->endpoints->container->getAndReturnSetOfPrimitives(
            [
                'string',
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.container.get_and_return_set_of_primitives.0',
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
    public function testGetAndReturnSetOfObjects(): void {
        $testId = 'endpoints.container.get_and_return_set_of_objects.0';
        $this->client->endpoints->container->getAndReturnSetOfObjects(
            [
                new ObjectWithRequiredField([
                    'string' => 'string',
                ]),
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.container.get_and_return_set_of_objects.0',
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
    public function testGetAndReturnMapPrimToPrim(): void {
        $testId = 'endpoints.container.get_and_return_map_prim_to_prim.0';
        $this->client->endpoints->container->getAndReturnMapPrimToPrim(
            [
                'string' => 'string',
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.container.get_and_return_map_prim_to_prim.0',
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
    public function testGetAndReturnMapOfPrimToObject(): void {
        $testId = 'endpoints.container.get_and_return_map_of_prim_to_object.0';
        $this->client->endpoints->container->getAndReturnMapOfPrimToObject(
            [
                'string' => new ObjectWithRequiredField([
                    'string' => 'string',
                ]),
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.container.get_and_return_map_of_prim_to_object.0',
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
    public function testGetAndReturnOptional(): void {
        $testId = 'endpoints.container.get_and_return_optional.0';
        $this->client->endpoints->container->getAndReturnOptional(
            new ObjectWithRequiredField([
                'string' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.container.get_and_return_optional.0',
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
        $this->client = new SeedClient(
            token: 'test-token',
        options: [
            'baseUrl' => 'http://localhost:8080',
        ],
        );
    }
}
