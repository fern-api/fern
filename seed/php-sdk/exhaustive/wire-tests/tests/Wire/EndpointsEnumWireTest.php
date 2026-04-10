<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\TypesWeatherReport;

class EndpointsEnumWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testEndpointsEnumGetAndReturnEnum(): void {
        $testId = 'endpoints_enum.endpoints_enum_get_and_return_enum.0';
        $this->client->endpointsEnum->endpointsEnumGetAndReturnEnum(
            TypesWeatherReport::Sunny->value,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_enum.endpoints_enum_get_and_return_enum.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/enum",
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
