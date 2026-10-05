<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Exceptions\SeedApiException;

class NoAuthWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testPostWithNoAuth(): void {
        $testId = 'no_auth.post_with_no_auth.0';
        $this->client->noAuth->postWithNoAuth(
            [
                'key' => "value",
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'no_auth.post_with_no_auth.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/no-auth",
            null,
            1
        );
    }

    /**
     */
    public function testPostWithNoAuthThrowsBadRequestBody(): void {
        $testId = 'no_auth.post_with_no_auth.1';
        try {
            $this->client->noAuth->postWithNoAuth(
                [
                    'key' => "value",
                ],
                [
                    'headers' => [
                        'X-Test-Id' => 'no_auth.post_with_no_auth.1',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(400, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message"}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/no-auth",
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
            'maxRetries' => 0,
        ],
        );
    }
}
