<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\Union\Types\Animal;
use Seed\Types\Union\Types\Dog;

class EndpointsUnionWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetAndReturnUnion(): void {
        $testId = 'endpoints.union.get_and_return_union.0';
        $this->client->endpoints->union->getAndReturnUnion(
            Animal::dog(new Dog([
                'name' => 'name',
                'likesToWoof' => true,
            ])),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.union.get_and_return_union.0',
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
        $this->client = new SeedClient(
            token: 'test-token',
        options: [
            'baseUrl' => 'http://localhost:8080',
        ],
        );
    }
}
