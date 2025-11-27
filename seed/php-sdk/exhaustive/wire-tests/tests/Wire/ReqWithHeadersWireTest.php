<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\ReqWithHeaders\Requests\ReqWithHeaders;

class ReqWithHeadersWireTest extends WireMockTestCase
{

    /**
     */
    public function testGetWithCustomHeader(): void {
        $testId = 'req_with_headers.get_with_custom_header.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->reqWithHeaders->getWithCustomHeader(
            new ReqWithHeaders([
                'xTestServiceHeader' => 'X-TEST-SERVICE-HEADER',
                'xTestEndpointHeader' => 'X-TEST-ENDPOINT-HEADER',
                'body' => 'string',
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/test-headers/custom-header",
            null,
            1
        );
    }
}
