<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Types\Union\Types\Animal;
use Seed\Types\Union\Types\Dog;

class EndpointsUnionWireTest extends WireMockTestCase
{

    /**
     */
    public function testGetAndReturnUnion(): void {
        $testId = 'endpoints.union.get_and_return_union.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->union->getAndReturnUnion(
            Animal::dog(new Dog([
                'name' => 'name',
                'likesToWoof' => true,
            ])),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/union",
            null,
            1
        );
    }
}
