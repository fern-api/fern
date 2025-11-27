<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;

class NoReqBodyWireTest extends WireMockTestCase
{

    /**
     */
    public function testGetWithNoRequestBody(): void {
        $testId = 'no_req_body.get_with_no_request_body.0';
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->noReqBody->getWithNoRequestBody();
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
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->noReqBody->postWithNoRequestBody();
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/no-req-body",
            null,
            1
        );
    }
}
