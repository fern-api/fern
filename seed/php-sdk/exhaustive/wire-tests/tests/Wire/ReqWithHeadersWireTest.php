<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\ReqWithHeaders\Requests\ReqWithHeaders;

class ReqWithHeadersWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetWithCustomHeader(): void {
        $testId = 'req_with_headers.get_with_custom_header.0';
        $this->client->reqWithHeaders->getWithCustomHeader(
            new ReqWithHeaders([
                'xTestServiceHeader' => 'X-TEST-SERVICE-HEADER',
                'xTestEndpointHeader' => 'X-TEST-ENDPOINT-HEADER',
                'body' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'req_with_headers.get_with_custom_header.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/test-headers/custom-header",
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
