<?php

namespace Seed\Tests\Wire;

use Http\Discovery\Psr17FactoryDiscovery;
use Http\Discovery\Psr18ClientDiscovery;
use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonEncoder;

/**
 * Base test case for WireMock-based wire tests.
 *
 * The WireMock container lifecycle is managed by the bootstrap file (tests/Wire/bootstrap.php)
 * which starts the container once before all tests and stops it after all tests complete.
 */
abstract class WireMockTestCase extends TestCase
{
    /**
     * Verifies the number of requests made to WireMock filtered by test ID for concurrency safety.
     *
     * @param string $testId The test ID used to filter requests
     * @param string $method The HTTP method (GET, POST, etc.)
     * @param string $urlPath The URL path to match
     * @param array<string, string>|null $queryParams Query parameters to match
     * @param int $expected Expected number of requests
     */
    protected function verifyRequestCount(
        string $testId,
        string $method,
        string $urlPath,
        ?array $queryParams,
        int $expected
    ): void {
        $client = Psr18ClientDiscovery::find();
        $requestFactory = Psr17FactoryDiscovery::findRequestFactory();
        $streamFactory = Psr17FactoryDiscovery::findStreamFactory();

        $body = [
            'method' => $method,
            'urlPath' => $urlPath,
            'headers' => [
                'X-Test-Id' => ['equalTo' => $testId],
            ],
        ];
        if ($queryParams !== null && $queryParams !== []) {
            $body['queryParameters'] = [];
            foreach ($queryParams as $k => $v) {
                $body['queryParameters'][$k] = ['equalTo' => (string) $v];
            }
        }

        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $request = $requestFactory->createRequest('POST', $wiremockUrl . '/__admin/requests/find')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($streamFactory->createStream(JsonEncoder::encode($body)));
        $response = $client->sendRequest($request);

        $this->assertSame(200, $response->getStatusCode(), 'Failed to query WireMock requests');

        $json = json_decode((string) $response->getBody(), true);
        
        // Ensure we have an array; otherwise, fail the test.
        if (!is_array($json)) {
            $this->fail('Expected WireMock to return a JSON object.');
        }

        /** @var array<string, mixed> $json */
        $requests = [];
        if (isset($json['requests']) && is_array($json['requests'])) {
            $requests = $json['requests'];
        }

        /** @var array<int, mixed> $requests */
        $this->assertCount(
            $expected,
            $requests,
            sprintf('Expected %d requests, found %d', $expected, count($requests))
        );
    }
}
