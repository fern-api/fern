<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\EndpointsParams\Requests\EndpointsParamsModifyWithPathRequest;
use Seed\EndpointsParams\Requests\EndpointsParamsModifyWithInlinePathRequest;
use Seed\EndpointsParams\Requests\EndpointsParamsGetWithQueryRequest;
use Seed\EndpointsParams\Requests\EndpointsParamsGetWithAllowMultipleQueryRequest;
use Seed\EndpointsParams\Requests\EndpointsParamsGetWithPathAndQueryRequest;
use Seed\EndpointsParams\Requests\EndpointsParamsGetWithInlinePathAndQueryRequest;

class EndpointsParamsWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testEndpointsParamsGetWithPath(): void {
        $testId = 'endpoints_params.endpoints_params_get_with_path.0';
        $this->client->endpointsParams->endpointsParamsGetWithPath(
            'param',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_get_with_path.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/params/path/param",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsParamsModifyWithPath(): void {
        $testId = 'endpoints_params.endpoints_params_modify_with_path.0';
        $this->client->endpointsParams->endpointsParamsModifyWithPath(
            'param',
            new EndpointsParamsModifyWithPathRequest([
                'body' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_modify_with_path.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "PUT",
            "/params/path/param",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsParamsGetWithInlinePath(): void {
        $testId = 'endpoints_params.endpoints_params_get_with_inline_path.0';
        $this->client->endpointsParams->endpointsParamsGetWithInlinePath(
            'param',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_get_with_inline_path.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/params/inline-path/param",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsParamsModifyWithInlinePath(): void {
        $testId = 'endpoints_params.endpoints_params_modify_with_inline_path.0';
        $this->client->endpointsParams->endpointsParamsModifyWithInlinePath(
            'param',
            new EndpointsParamsModifyWithInlinePathRequest([
                'body' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_modify_with_inline_path.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "PUT",
            "/params/inline-path/param",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsParamsGetWithQuery(): void {
        $testId = 'endpoints_params.endpoints_params_get_with_query.0';
        $this->client->endpointsParams->endpointsParamsGetWithQuery(
            new EndpointsParamsGetWithQueryRequest([
                'query' => 'query',
                'number' => 1,
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_get_with_query.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/params",
            ['query' => 'query', 'number' => '1'],
            1
        );
    }

    /**
     */
    public function testEndpointsParamsGetWithAllowMultipleQuery(): void {
        $testId = 'endpoints_params.endpoints_params_get_with_allow_multiple_query.0';
        $this->client->endpointsParams->endpointsParamsGetWithAllowMultipleQuery(
            new EndpointsParamsGetWithAllowMultipleQueryRequest([
                'query' => [
                    'query',
                ],
                'number' => [
                    1,
                ],
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_get_with_allow_multiple_query.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/params/allow-multiple",
            ['query' => 'query', 'number' => '1'],
            1
        );
    }

    /**
     */
    public function testEndpointsParamsGetWithPathAndQuery(): void {
        $testId = 'endpoints_params.endpoints_params_get_with_path_and_query.0';
        $this->client->endpointsParams->endpointsParamsGetWithPathAndQuery(
            'param',
            new EndpointsParamsGetWithPathAndQueryRequest([
                'query' => 'query',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_get_with_path_and_query.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/params/path-query/param",
            ['query' => 'query'],
            1
        );
    }

    /**
     */
    public function testEndpointsParamsGetWithInlinePathAndQuery(): void {
        $testId = 'endpoints_params.endpoints_params_get_with_inline_path_and_query.0';
        $this->client->endpointsParams->endpointsParamsGetWithInlinePathAndQuery(
            'param',
            new EndpointsParamsGetWithInlinePathAndQueryRequest([
                'query' => 'query',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_get_with_inline_path_and_query.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/params/inline-path-query/param",
            ['query' => 'query'],
            1
        );
    }

    /**
     */
    public function testEndpointsParamsGetWithBooleanPath(): void {
        $testId = 'endpoints_params.endpoints_params_get_with_boolean_path.0';
        $this->client->endpointsParams->endpointsParamsGetWithBooleanPath(
            true,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_get_with_boolean_path.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/params/path-bool/true",
            null,
            1
        );
    }

    /**
     */
    public function testEndpointsParamsGetWithPathAndErrors(): void {
        $testId = 'endpoints_params.endpoints_params_get_with_path_and_errors.0';
        $this->client->endpointsParams->endpointsParamsGetWithPathAndErrors(
            'param',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_params.endpoints_params_get_with_path_and_errors.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/params/path-with-errors/param",
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
