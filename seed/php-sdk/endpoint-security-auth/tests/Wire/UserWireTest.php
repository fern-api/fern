<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

class UserWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetWithBearer(): void {
        $testId = 'user.get_with_bearer.0';
        $this->client->user->getWithBearer(
            [
                'headers' => [
                    'X-Test-Id' => 'user.get_with_bearer.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/users",
            null,
            1
        );
        $this->verifyAuthHeaders(
            $testId,
            "GET",
            "/users",
            [
                'Authorization' => ['matches' => 'Bearer .*'],
                'X-API-Key' => ['absent' => true],
            ]
        );
    }

    /**
     */
    public function testGetWithApiKey(): void {
        $testId = 'user.get_with_api_key.0';
        $this->client->user->getWithApiKey(
            [
                'headers' => [
                    'X-Test-Id' => 'user.get_with_api_key.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/users",
            null,
            1
        );
        $this->verifyAuthHeaders(
            $testId,
            "GET",
            "/users",
            [
                'Authorization' => ['absent' => true],
                'X-API-Key' => ['matches' => '.*'],
            ]
        );
    }

    /**
     */
    public function testGetWithOAuth(): void {
        $testId = 'user.get_with_o_auth.0';
        $this->client->user->getWithOAuth(
            [
                'headers' => [
                    'X-Test-Id' => 'user.get_with_o_auth.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/users",
            null,
            1
        );
        $this->verifyAuthHeaders(
            $testId,
            "GET",
            "/users",
            [
                'Authorization' => ['matches' => 'Bearer .*'],
                'X-API-Key' => ['absent' => true],
            ]
        );
    }

    /**
     */
    public function testGetWithBasic(): void {
        $testId = 'user.get_with_basic.0';
        $this->client->user->getWithBasic(
            [
                'headers' => [
                    'X-Test-Id' => 'user.get_with_basic.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/users",
            null,
            1
        );
        $this->verifyAuthHeaders(
            $testId,
            "GET",
            "/users",
            [
                'Authorization' => ['matches' => 'Basic .*'],
                'X-API-Key' => ['absent' => true],
            ]
        );
    }

    /**
     */
    public function testGetWithInferredAuth(): void {
        $testId = 'user.get_with_inferred_auth.0';
        $this->client->user->getWithInferredAuth(
            [
                'headers' => [
                    'X-Test-Id' => 'user.get_with_inferred_auth.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/users",
            null,
            1
        );
        $this->verifyAuthHeaders(
            $testId,
            "GET",
            "/users",
            [
                'Authorization' => ['matches' => 'Bearer .*'],
                'X-API-Key' => ['absent' => true],
            ]
        );
    }

    /**
     */
    public function testGetWithAnyAuth(): void {
        $testId = 'user.get_with_any_auth.0';
        $this->client->user->getWithAnyAuth(
            [
                'headers' => [
                    'X-Test-Id' => 'user.get_with_any_auth.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/users",
            null,
            1
        );
        $this->verifyAuthHeaders(
            $testId,
            "GET",
            "/users",
            [
                'Authorization' => ['matches' => 'Bearer .*'],
                'X-API-Key' => ['absent' => true],
            ]
        );
    }

    /**
     */
    public function testGetWithAllAuth(): void {
        $testId = 'user.get_with_all_auth.0';
        $this->client->user->getWithAllAuth(
            [
                'headers' => [
                    'X-Test-Id' => 'user.get_with_all_auth.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/users",
            null,
            1
        );
        $this->verifyAuthHeaders(
            $testId,
            "GET",
            "/users",
            [
                'Authorization' => ['matches' => '.*'],
                'X-API-Key' => ['matches' => '.*'],
            ]
        );
    }

    /**
     */
    protected function setUp(): void {
        parent::setUp();
        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $this->client = new SeedClient(
            token: 'test-token',
                apiKey: 'test-apiKey',
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                username: 'test-username',
                password: 'test-password',
        options: [
            'baseUrl' => $wiremockUrl,
        ],
        );
    }
}
