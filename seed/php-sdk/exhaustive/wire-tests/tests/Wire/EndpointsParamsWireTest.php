<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\GetWithQuery;
use Seed\Endpoints\Params\Requests\GetWithPathAndQuery;

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
    public function testGetWithInlinePath(): void {
        $testId = 'endpoints.params.get_with_inline_path.0';
        $this->client->endpoints->params->getWithPath(
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
            "/params/path/param",
            null,
            1
        );
    }

    /**
     */
    public function testGetWithQuery(): void {
        $testId = 'endpoints.params.get_with_query.0';
        $this->client->endpoints->params->getWithQuery(
            new GetWithQuery([
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
        $this->client->endpoints->params->getWithQuery(
            new GetWithQuery([
                'query' => 'query',
                'number' => 1,
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
            "/params",
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
            new GetWithPathAndQuery([
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
        $this->client->endpoints->params->getWithPathAndQuery(
            'param',
            new GetWithPathAndQuery([
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
            "/params/path-query/param",
            ['query' => 'query'],
            1
        );
    }

    /**
     */
    public function testModifyWithPath(): void {
        $testId = 'endpoints.params.modify_with_path.0';
        $this->client->endpoints->params->modifyWithPath(
            'param',
            'string',
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
    public function testModifyWithInlinePath(): void {
        $testId = 'endpoints.params.modify_with_inline_path.0';
        $this->client->endpoints->params->modifyWithPath(
            'param',
            'string',
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.params.modify_with_inline_path.0',
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
