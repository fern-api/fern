<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\ModifyWithPathParamsRequest;
use Seed\Endpoints\Params\Requests\ModifyWithInlinePathParamsRequest;
use Seed\Endpoints\Params\Requests\GetWithQueryParamsRequest;
use Seed\Endpoints\Params\Requests\GetWithAllowMultipleQueryParamsRequest;
use Seed\Endpoints\Params\Requests\GetWithPathAndQueryParamsRequest;
use Seed\Endpoints\Params\Requests\GetWithInlinePathAndQueryParamsRequest;

class EndpointsParamsWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetWithPath(): void {
        $testId = 'endpoints.params.get_with_path.0';
        $this->client->endpoints->params->getWithPath(
            'param',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.params.get_with_path.0',
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
    public function testModifyWithPath(): void {
        $testId = 'endpoints.params.modify_with_path.0';
        $this->client->endpoints->params->modifyWithPath(
            'param',
            new ModifyWithPathParamsRequest([
                'body' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.params.modify_with_path.0',
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
    public function testGetWithInlinePath(): void {
        $testId = 'endpoints.params.get_with_inline_path.0';
        $this->client->endpoints->params->getWithInlinePath(
            'param',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.params.get_with_inline_path.0',
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
    public function testModifyWithInlinePath(): void {
        $testId = 'endpoints.params.modify_with_inline_path.0';
        $this->client->endpoints->params->modifyWithInlinePath(
            'param',
            new ModifyWithInlinePathParamsRequest([
                'body' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.params.modify_with_inline_path.0',
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
    public function testGetWithQuery(): void {
        $testId = 'endpoints.params.get_with_query.0';
        $this->client->endpoints->params->getWithQuery(
            new GetWithQueryParamsRequest([
                'query' => 'query',
                'number' => 1,
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.params.get_with_query.0',
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
    public function testGetWithAllowMultipleQuery(): void {
        $testId = 'endpoints.params.get_with_allow_multiple_query.0';
        $this->client->endpoints->params->getWithAllowMultipleQuery(
            new GetWithAllowMultipleQueryParamsRequest([
                'query' => [
                    'query',
                ],
                'number' => [
                    1,
                ],
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.params.get_with_allow_multiple_query.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/params/allow-multiple-query",
            ['query' => 'query', 'number' => '1'],
            1
        );
    }

    /**
     */
    public function testGetWithPathAndQuery(): void {
        $testId = 'endpoints.params.get_with_path_and_query.0';
        $this->client->endpoints->params->getWithPathAndQuery(
            'param',
            new GetWithPathAndQueryParamsRequest([
                'query' => 'query',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.params.get_with_path_and_query.0',
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
    public function testGetWithInlinePathAndQuery(): void {
        $testId = 'endpoints.params.get_with_inline_path_and_query.0';
        $this->client->endpoints->params->getWithInlinePathAndQuery(
            'param',
            new GetWithInlinePathAndQueryParamsRequest([
                'query' => 'query',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.params.get_with_inline_path_and_query.0',
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
