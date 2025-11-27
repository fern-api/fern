namespace Seed\Tests;

use PHPUnit\Framework\TestCase;
use Seed\SeedClient;

class NoAuthWireTest extends TestCase
{

    /**
     */
    public function testPostWithNoAuth(): void {
        $testId = 'no_auth.post_with_no_auth.0';
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
        $client->noAuth->postWithNoAuth(
            [
                'key' => "value",
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/no-auth",
            null,
            1
        );
    }
}
