<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

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
    protected function setUp(): void {
        parent::setUp();
        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $this->client = new SeedClient(
            username: 'test-username',
        options: [
            'baseUrl' => $wiremockUrl,
        ],
        );
    }
}
