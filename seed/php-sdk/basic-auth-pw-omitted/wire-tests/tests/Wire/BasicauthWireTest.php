<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

class BasicauthWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetwithbasicauth(): void {
        $testId = 'basicauth.getwithbasicauth.0';
        $this->client->basicauth->getwithbasicauth(
            [
                'headers' => [
                    'X-Test-Id' => 'basicauth.getwithbasicauth.0',
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
    public function testPostwithbasicauth(): void {
        $testId = 'basicauth.postwithbasicauth.0';
        $this->client->basicauth->postwithbasicauth(
            [
                'key' => "value",
            ],
            [
                'headers' => [
                    'X-Test-Id' => 'basicauth.postwithbasicauth.0',
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
                password: 'test-password',
        options: [
            'baseUrl' => $wiremockUrl,
        ],
        );
    }
}
