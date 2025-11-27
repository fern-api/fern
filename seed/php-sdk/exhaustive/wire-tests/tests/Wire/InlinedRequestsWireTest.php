<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\InlinedRequests\Requests\PostWithObjectBody;
use Seed\Types\Object\Types\ObjectWithOptionalField;
use DateTime;

class InlinedRequestsWireTest extends WireMockTestCase
{

    /**
     */
    public function testPostWithObjectBodyandResponse(): void {
        $testId = 'inlined_requests.post_with_object_bodyand_response.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->inlinedRequests->postWithObjectBodyandResponse(
            new PostWithObjectBody([
                'string' => 'string',
                'integer' => 1,
                'nestedObject' => new ObjectWithOptionalField([
                    'string' => 'string',
                    'integer' => 1,
                    'long' => 1000000,
                    'double' => 1.1,
                    'bool' => true,
                    'datetime' => new DateTime('2024-01-15T09:30:00Z'),
                    'date' => new DateTime('2023-01-15'),
                    'uuid' => 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
                    'base64' => 'SGVsbG8gd29ybGQh',
                    'list' => [
                        'list',
                        'list',
                    ],
                    'set' => [
                        'set',
                    ],
                    'map' => [
                        1 => 'map',
                    ],
                    'bigint' => '1000000',
                ]),
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/req-bodies/object",
            null,
            1
        );
    }
}
