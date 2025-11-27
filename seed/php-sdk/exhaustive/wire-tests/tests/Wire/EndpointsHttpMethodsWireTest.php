<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithRequiredField;
use Seed\Types\Object\Types\ObjectWithOptionalField;
use DateTime;

class EndpointsHttpMethodsWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testTestGet(): void {
        $testId = 'endpoints.http_methods.test_get.0';
        $this->client->endpoints->httpMethods->testGet(
            'id',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.http_methods.test_get.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/http-methods/id",
            null,
            1
        );
    }

    /**
     */
    public function testTestPost(): void {
        $testId = 'endpoints.http_methods.test_post.0';
        $this->client->endpoints->httpMethods->testPost(
            new ObjectWithRequiredField([
                'string' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.http_methods.test_post.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/http-methods",
            null,
            1
        );
    }

    /**
     */
    public function testTestPut(): void {
        $testId = 'endpoints.http_methods.test_put.0';
        $this->client->endpoints->httpMethods->testPut(
            'id',
            new ObjectWithRequiredField([
                'string' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.http_methods.test_put.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "PUT",
            "/http-methods/id",
            null,
            1
        );
    }

    /**
     */
    public function testTestPatch(): void {
        $testId = 'endpoints.http_methods.test_patch.0';
        $this->client->endpoints->httpMethods->testPatch(
            'id',
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
                    'X-Test-Id' => 'endpoints.http_methods.test_patch.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "PATCH",
            "/http-methods/id",
            null,
            1
        );
    }

    /**
     */
    public function testTestDelete(): void {
        $testId = 'endpoints.http_methods.test_delete.0';
        $this->client->endpoints->httpMethods->testDelete(
            'id',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.http_methods.test_delete.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "DELETE",
            "/http-methods/id",
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
