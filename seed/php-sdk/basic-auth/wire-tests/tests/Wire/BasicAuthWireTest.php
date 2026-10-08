<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Exceptions\SeedApiException;

class BasicAuthWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetWithBasicAuth(): void {
        $testId = 'basic_auth.get_with_basic_auth.0';
        $this->client->basicAuth->getWithBasicAuth(
            [
                'headers' => [
                    'X-Test-Id' => 'basic_auth.get_with_basic_auth.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/basic-auth",
            null,
            1
        );
    }

    /**
     */
    public function testGetWithBasicAuthThrowsUnauthorizedRequest(): void {
        $testId = 'basic_auth.get_with_basic_auth.1';
        try {
            $this->client->basicAuth->getWithBasicAuth(
                [
                    'headers' => [
                        'X-Test-Id' => 'basic_auth.get_with_basic_auth.1',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(401, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message"}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/basic-auth",
            null,
            1
        );
    }

    /**
     */
    public function testPostWithBasicAuth(): void {
        $testId = 'basic_auth.post_with_basic_auth.0';
        $this->client->basicAuth->postWithBasicAuth(
            [
                'key' => "value",
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'basic_auth.post_with_basic_auth.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/basic-auth",
            null,
            1
        );
    }

    /**
     */
    public function testPostWithBasicAuthThrowsUnauthorizedRequest(): void {
        $testId = 'basic_auth.post_with_basic_auth.1';
        try {
            $this->client->basicAuth->postWithBasicAuth(
                [
                    'key' => "value",
                ],
                [
                    'headers' => [
                        'X-Test-Id' => 'basic_auth.post_with_basic_auth.1',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(401, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message"}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/basic-auth",
            null,
            1
        );
    }

    /**
     */
    public function testPostWithBasicAuthThrowsBadRequest(): void {
        $testId = 'basic_auth.post_with_basic_auth.2';
        try {
            $this->client->basicAuth->postWithBasicAuth(
                [
                    'key' => "value",
                ],
                [
                    'headers' => [
                        'X-Test-Id' => 'basic_auth.post_with_basic_auth.2',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(400, $exception->getCode());
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/basic-auth",
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
            username: 'test-username',
                password: 'test-password',
        options: [
            'baseUrl' => $wiremockUrl,
            'maxRetries' => 0,
        ],
        );
    }
}
