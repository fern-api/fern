namespace Seed\Tests;

use PHPUnit\Framework\TestCase;
use Seed\SeedClient;

class EndpointsPutWireTest extends TestCase
{

    /**
     */
    public function testAdd(): void {
        $testId = 'endpoints.put.add.0';
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
        $client->endpoints->put->add(
            'id',
        );
        $this->verifyRequestCount(
            $testId,
            "PUT",
            "/id",
            null,
            1
        );
    }
}
