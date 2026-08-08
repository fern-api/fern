<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Auth\Requests\GetTokenRequest;

class AuthWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetToken(): void {
        $testId = 'auth.get_token.0';
        $this->client->auth->getToken(
            new GetTokenRequest([
                'clientId' => 'client_id',
                'clientSecret' => 'client_secret',
                'audience' => 'https://api.example.com',
                'grantType' => 'client_credentials',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'auth.get_token.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/token",
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
