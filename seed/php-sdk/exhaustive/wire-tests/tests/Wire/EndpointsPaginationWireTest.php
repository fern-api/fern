<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\EndpointsPagination\Requests\EndpointsPaginationListItemsRequest;

class EndpointsPaginationWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testEndpointsPaginationListItems(): void {
        $testId = 'endpoints_pagination.endpoints_pagination_list_items.0';
        $this->client->endpointsPagination->endpointsPaginationListItems(
            new EndpointsPaginationListItemsRequest([]),
            [
                'headers' => [
                    'X-Test-Id' => 'endpoints_pagination.endpoints_pagination_list_items.0',
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
