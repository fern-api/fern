<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Endpoints\Pagination\Requests\ListItemsRequest;

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
        $response = $this->client->endpoints->pagination->listItems(
            new ListItemsRequest([
                'cursor' => 'cursor',
                'limit' => 1,
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints.pagination.list_items.0',
                ],
            ],
        );
        foreach ($response as $item) {
            break;
        }
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/pagination",
            ['cursor' => 'cursor', 'limit' => '1'],
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
