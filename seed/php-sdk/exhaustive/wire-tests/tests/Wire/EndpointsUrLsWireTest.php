<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

class EndpointsUrLsWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testEndpointsUrlsWithMixedCase(): void {
        $testId = 'endpoints_ur_ls.endpoints_urls_with_mixed_case.0';
        $this->client->endpointsUrLs->endpointsUrlsWithMixedCase(
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_ur_ls.endpoints_urls_with_mixed_case.0',
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
    public function testEndpointsUrlsNoEndingSlash(): void {
        $testId = 'endpoints_ur_ls.endpoints_urls_no_ending_slash.0';
        $this->client->endpointsUrLs->endpointsUrlsNoEndingSlash(
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_ur_ls.endpoints_urls_no_ending_slash.0',
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
    public function testEndpointsUrlsWithEndingSlash(): void {
        $testId = 'endpoints_ur_ls.endpoints_urls_with_ending_slash.0';
        $this->client->endpointsUrLs->endpointsUrlsWithEndingSlash(
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_ur_ls.endpoints_urls_with_ending_slash.0',
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
    public function testEndpointsUrlsWithUnderscores(): void {
        $testId = 'endpoints_ur_ls.endpoints_urls_with_underscores.0';
        $this->client->endpointsUrLs->endpointsUrlsWithUnderscores(
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_ur_ls.endpoints_urls_with_underscores.0',
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
        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $this->client = new SeedClient(
            token: 'test-token',
        options: [
            'baseUrl' => $wiremockUrl,
        ],
        );
    }
}
