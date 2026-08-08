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
    public function testGet(): void {
        $testId = 'user.get.0';
        $this->client->user->get(
            [
                'headers' => [
                    'X-Test-Id' => 'user.get.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/users",
            null,
            1
        );
    }

    /**
     */
    public function testGetAdmins(): void {
        $testId = 'user.get_admins.0';
        $this->client->user->getAdmins(
            [
                'headers' => [
                    'X-Test-Id' => 'user.get_admins.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/admins",
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
