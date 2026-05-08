<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Endpoints\Pagination\Requests\ListItemsPaginationRequest;

class EndpointsPaginationWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testListItems(): void {
        $testId = 'endpoints.pagination.list_items.0';
        $this->client->endpoints->pagination->listItems(
            new ListItemsPaginationRequest([]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.pagination.list_items.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/pagination",
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
