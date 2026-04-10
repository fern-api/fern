<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

class NoreqbodyWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetwithnorequestbody(): void {
        $testId = 'noreqbody.getwithnorequestbody.0';
        $this->client->noreqbody->getwithnorequestbody(
            [
                'headers' => [
                    'X-Test-Id' => 'noreqbody.getwithnorequestbody.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/no-req-body",
            null,
            1
        );
    }

    /**
     */
    public function testPostwithnorequestbody(): void {
        $testId = 'noreqbody.postwithnorequestbody.0';
        $this->client->noreqbody->postwithnorequestbody(
            [
                'headers' => [
                    'X-Test-Id' => 'noreqbody.postwithnorequestbody.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/no-req-body",
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
