namespace Seed\Tests;

use PHPUnit\Framework\TestCase;
use Seed\SeedClient;

class EndpointsUrlsWireTest extends TestCase
{

    /**
     */
    public function testWithMixedCase(): void {
        $testId = 'endpoints.urls.with_mixed_case.0';
        $client = new SeedClient(
            options: [
                'baseUrl' => 'http://localhost:8080',
                'headers' => ['X-Test-Id' => $testId],
            ]
        );
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->urls->withMixedCase();
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/urls/MixedCase",
            null,
            1
        );
    }

    /**
     */
    public function testNoEndingSlash(): void {
        $testId = 'endpoints.urls.no_ending_slash.0';
        $client = new SeedClient(
            options: [
                'baseUrl' => 'http://localhost:8080',
                'headers' => ['X-Test-Id' => $testId],
            ]
        );
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->urls->noEndingSlash();
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/urls/no-ending-slash",
            null,
            1
        );
    }

    /**
     */
    public function testWithEndingSlash(): void {
        $testId = 'endpoints.urls.with_ending_slash.0';
        $client = new SeedClient(
            options: [
                'baseUrl' => 'http://localhost:8080',
                'headers' => ['X-Test-Id' => $testId],
            ]
        );
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->urls->withEndingSlash();
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/urls/with-ending-slash/",
            null,
            1
        );
    }

    /**
     */
    public function testWithUnderscores(): void {
        $testId = 'endpoints.urls.with_underscores.0';
        $client = new SeedClient(
            options: [
                'baseUrl' => 'http://localhost:8080',
                'headers' => ['X-Test-Id' => $testId],
            ]
        );
        $client = new SeedClient(
            token: '<token>',
            options: [
                'baseUrl' => 'http://localhost:8080',
            ],
        );
        $client->endpoints->urls->withUnderscores();
        $this->verifyRequestCount(
            $testId,
            "GET",
            "/urls/with_underscores",
            null,
            1
        );
    }
}
