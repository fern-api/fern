namespace Seed\Tests;

use PHPUnit\Framework\TestCase;
use Seed\SeedClient;
use Seed\ReqWithHeaders\Requests\ReqWithHeaders;

class ReqWithHeadersWireTest extends TestCase
{

    /**
     */
    public function testGetWithCustomHeader(): void {
        $testId = 'req_with_headers.get_with_custom_header.0';
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
        $client->reqWithHeaders->getWithCustomHeader(
            new ReqWithHeaders([
                'xTestServiceHeader' => 'X-TEST-SERVICE-HEADER',
                'xTestEndpointHeader' => 'X-TEST-ENDPOINT-HEADER',
                'body' => 'string',
            ]),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/test-headers/custom-header",
            null,
            1
        );
    }
}
