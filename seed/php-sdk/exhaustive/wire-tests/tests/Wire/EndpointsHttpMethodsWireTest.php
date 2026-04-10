<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\EndpointsHttpMethods\Requests\EndpointsHttpMethodsTestPutRequest;
use Seed\Types\TypesObjectWithRequiredField;
use Seed\EndpointsHttpMethods\Requests\EndpointsHttpMethodsTestPatchRequest;
use Seed\Types\TypesObjectWithOptionalField;

class EndpointsHttpMethodsWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testEndpointsHttpMethodsTestGet(): void {
        $testId = 'endpoints_http_methods.endpoints_http_methods_test_get.0';
        $this->client->endpointsHttpMethods->endpointsHttpMethodsTestGet(
            'id',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_http_methods.endpoints_http_methods_test_get.0',
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
    public function testEndpointsHttpMethodsTestPut(): void {
        $testId = 'endpoints_http_methods.endpoints_http_methods_test_put.0';
        $this->client->endpointsHttpMethods->endpointsHttpMethodsTestPut(
            'id',
            new EndpointsHttpMethodsTestPutRequest([
                'body' => new TypesObjectWithRequiredField([
                    'string' => 'string',
                ]),
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_http_methods.endpoints_http_methods_test_put.0',
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
    public function testEndpointsHttpMethodsTestDelete(): void {
        $testId = 'endpoints_http_methods.endpoints_http_methods_test_delete.0';
        $this->client->endpointsHttpMethods->endpointsHttpMethodsTestDelete(
            'id',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_http_methods.endpoints_http_methods_test_delete.0',
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
    public function testEndpointsHttpMethodsTestPatch(): void {
        $testId = 'endpoints_http_methods.endpoints_http_methods_test_patch.0';
        $this->client->endpointsHttpMethods->endpointsHttpMethodsTestPatch(
            'id',
            new EndpointsHttpMethodsTestPatchRequest([
                'body' => new TypesObjectWithOptionalField([]),
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_http_methods.endpoints_http_methods_test_patch.0',
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
    public function testEndpointsHttpMethodsTestPost(): void {
        $testId = 'endpoints_http_methods.endpoints_http_methods_test_post.0';
        $this->client->endpointsHttpMethods->endpointsHttpMethodsTestPost(
            new TypesObjectWithRequiredField([
                'string' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_http_methods.endpoints_http_methods_test_post.0',
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
