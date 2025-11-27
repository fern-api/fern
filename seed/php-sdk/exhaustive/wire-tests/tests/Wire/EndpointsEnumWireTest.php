<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\Enum\Types\WeatherReport;

class EndpointsEnumWireTest extends WireMockTestCase
{

    /**
     */
    public function testGetAndReturnEnum(): void {
        $testId = 'endpoints.enum.get_and_return_enum.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->enum->getAndReturnEnum(
            WeatherReport::Sunny->value,
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/enum",
            null,
            1
        );
    }
}
