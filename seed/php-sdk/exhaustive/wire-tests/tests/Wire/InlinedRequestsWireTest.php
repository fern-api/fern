<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\InlinedRequests\Requests\PostWithObjectBodyandResponseInlinedRequestsRequest;
use Seed\Types\TypesObjectWithOptionalField;

class InlinedRequestsWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testPostWithObjectBodyandResponse(): void {
        $testId = 'inlined_requests.post_with_object_bodyand_response.0';
        $this->client->inlinedRequests->postWithObjectBodyandResponse(
            new PostWithObjectBodyandResponseInlinedRequestsRequest([
                'string' => 'string',
                'integer' => 1,
                'nestedObject' => new TypesObjectWithOptionalField([]),
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'inlined_requests.post_with_object_bodyand_response.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/req-bodies/object",
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
