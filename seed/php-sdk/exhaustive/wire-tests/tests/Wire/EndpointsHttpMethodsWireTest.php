<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Endpoints\HttpMethods\Requests\TestPutHttpMethodsRequest;
use Seed\Types\TypesObjectWithRequiredField;
use Seed\Endpoints\HttpMethods\Requests\TestPatchHttpMethodsRequest;
use Seed\Types\TypesObjectWithOptionalField;

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
    public function testTestPut(): void {
        $testId = 'endpoints.http_methods.test_put.0';
        $this->client->endpoints->httpMethods->testPut(
            'id',
            new TestPutHttpMethodsRequest([
                'body' => new TypesObjectWithRequiredField([
                    'string' => 'string',
                ]),
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
    public function testTestPatch(): void {
        $testId = 'endpoints.http_methods.test_patch.0';
        $this->client->endpoints->httpMethods->testPatch(
            'id',
            new TestPatchHttpMethodsRequest([
                'body' => new TypesObjectWithOptionalField([]),
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
    public function testTestPost(): void {
        $testId = 'endpoints.http_methods.test_post.0';
        $this->client->endpoints->httpMethods->testPost(
            new TypesObjectWithRequiredField([
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
