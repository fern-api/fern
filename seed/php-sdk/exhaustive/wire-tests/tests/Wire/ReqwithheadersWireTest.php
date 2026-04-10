<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Reqwithheaders\Requests\ReqWithHeadersGetWithCustomHeaderRequest;

class ReqwithheadersWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetwithcustomheader(): void {
        $testId = 'reqwithheaders.getwithcustomheader.0';
        $this->client->reqwithheaders->getwithcustomheader(
            new ReqWithHeadersGetWithCustomHeaderRequest([
                'testEndpointHeader' => 'X-TEST-ENDPOINT-HEADER',
                'body' => 'string',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'reqwithheaders.getwithcustomheader.0',
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
