<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

class NoauthWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testPostwithnoauth(): void {
        $testId = 'noauth.postwithnoauth.0';
        $this->client->noauth->postwithnoauth(
            [
                'key' => "value",
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'noauth.postwithnoauth.0',
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
        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $this->client = new SeedClient(
            token: 'test-token',
        options: [
            'baseUrl' => $wiremockUrl,
        ],
        );
    }
}
