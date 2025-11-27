<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

class EndpointsPutWireTest extends WireMockTestCase
{

    /**
     */
    public function testAdd(): void {
        $testId = 'endpoints.put.add.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->put->add(
            'id',
        );
        $this->verifyRequestCount(
            $testId,
            "PUT",
            "/id",
            null,
            1
        );
    }
}
