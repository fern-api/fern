<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\TypesAnimalZero;
use Seed\Types\TypesAnimalZeroAnimal;

class EndpointsUnionWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testEndpointsUnionGetAndReturnUnion(): void {
        $testId = 'endpoints_union.endpoints_union_get_and_return_union.0';
        $this->client->endpointsUnion->endpointsUnionGetAndReturnUnion(
            new TypesAnimalZero([
                'name' => 'name',
                'likesToWoof' => true,
                'animal' => TypesAnimalZeroAnimal::Dog->value,
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_union.endpoints_union_get_and_return_union.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/union",
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
