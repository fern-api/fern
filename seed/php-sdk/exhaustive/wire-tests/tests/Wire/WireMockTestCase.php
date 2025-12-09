<?php

namespace Seed\Tests\Wire;

use GuzzleHttp\Client as HttpClient;
use PHPUnit\Framework\TestCase;

/**
 * Base test case for WireMock-based wire tests.
 *
 * This class manages the WireMock container lifecycle for integration tests.
 */
abstract class WireMockTestCase extends TestCase
{
    protected static string $dockerComposeFile;

    public static function setUpBeforeClass(): void
    {
        $testDir = __DIR__;
        $projectRoot = \dirname($testDir, 2);
        $wiremockDir = $projectRoot . '/wiremock';
        self::$dockerComposeFile = $wiremockDir . '/docker-compose.test.yml';

        echo "\nStarting WireMock container...\n";
        $cmd = sprintf(
            'docker compose -f %s up -d --wait 2>&1',
            escapeshellarg(self::$dockerComposeFile)
        );
        exec($cmd, $output, $exitCode);
        if ($exitCode !== 0) {
            throw new \RuntimeException("Failed to start WireMock: " . implode("\n", $output));
        }
        echo "WireMock container is ready\n";
    }

    public static function tearDownAfterClass(): void
    {
        if (!isset(self::$dockerComposeFile)) {
            return;
        }
        echo "\nStopping WireMock container...\n";
        $cmd = sprintf(
            'docker compose -f %s down -v 2>&1',
            escapeshellarg(self::$dockerComposeFile)
        );
        exec($cmd);
    }

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
        $client = new HttpClient();
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

        $response = $client->post('http://localhost:8080/__admin/requests/find', [
            'json' => $body,
        ]);

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
