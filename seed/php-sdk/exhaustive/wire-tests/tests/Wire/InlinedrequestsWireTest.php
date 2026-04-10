<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Inlinedrequests\Requests\InlinedRequestsPostWithObjectBodyandResponseRequest;
use Seed\Types\TypesObjectWithOptionalField;

class InlinedrequestsWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testPostwithobjectbodyandresponse(): void {
        $testId = 'inlinedrequests.postwithobjectbodyandresponse.0';
        $this->client->inlinedrequests->postwithobjectbodyandresponse(
            new InlinedRequestsPostWithObjectBodyandResponseRequest([
                'string' => 'string',
                'integer' => 1,
                'nestedObject' => new TypesObjectWithOptionalField([]),
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'inlinedrequests.postwithobjectbodyandresponse.0',
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
