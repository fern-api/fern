<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\Enum\Types\WeatherReport;

class EndpointsEnumWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetAndReturnEnum(): void {
        $testId = 'endpoints.enum.get_and_return_enum.0';
        $this->client->endpoints->enum->getAndReturnEnum(
            WeatherReport::Sunny->value,
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.enum.get_and_return_enum.0',
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
        $this->client = new SeedClient(
            token: 'test-token',
        options: [
            'baseUrl' => 'http://localhost:8080',
        ],
        );
    }
}
