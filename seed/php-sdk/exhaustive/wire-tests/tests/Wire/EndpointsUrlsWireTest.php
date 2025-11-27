<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

class EndpointsUrlsWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testWithMixedCase(): void {
        $testId = 'endpoints.urls.with_mixed_case.0';
        $this->client->endpoints->urls->withMixedCase(
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.urls.with_mixed_case.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/urls/MixedCase",
            null,
            1
        );
    }

    /**
     */
    public function testNoEndingSlash(): void {
        $testId = 'endpoints.urls.no_ending_slash.0';
        $this->client->endpoints->urls->noEndingSlash(
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.urls.no_ending_slash.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/urls/no-ending-slash",
            null,
            1
        );
    }

    /**
     */
    public function testWithEndingSlash(): void {
        $testId = 'endpoints.urls.with_ending_slash.0';
        $this->client->endpoints->urls->withEndingSlash(
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.urls.with_ending_slash.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/urls/with-ending-slash/",
            null,
            1
        );
    }

    /**
     */
    public function testWithUnderscores(): void {
        $testId = 'endpoints.urls.with_underscores.0';
        $this->client->endpoints->urls->withUnderscores(
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.urls.with_underscores.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/urls/with_underscores",
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
