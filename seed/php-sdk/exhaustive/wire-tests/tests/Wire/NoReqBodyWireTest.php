<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

class NoReqBodyWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testGetWithNoRequestBody(): void {
        $testId = 'no_req_body.get_with_no_request_body.0';
        $this->client->noReqBody->getWithNoRequestBody(
            [
                'headers' => [
                    'X-Test-Id' => 'no_req_body.get_with_no_request_body.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/no-req-body",
            null,
            1
        );
    }

    /**
     */
    public function testPostWithNoRequestBody(): void {
        $testId = 'no_req_body.post_with_no_request_body.0';
        $this->client->noReqBody->postWithNoRequestBody(
            [
                'headers' => [
                    'X-Test-Id' => 'no_req_body.post_with_no_request_body.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/no-req-body",
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
