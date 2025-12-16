<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

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
