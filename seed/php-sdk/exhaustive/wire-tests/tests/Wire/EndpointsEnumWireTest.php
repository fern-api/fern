namespace Seed\Tests;

use PHPUnit\Framework\TestCase;
use Seed\SeedClient;
use Seed\Types\Enum\Types\WeatherReport;

class EndpointsEnumWireTest extends TestCase
{

    /**
     */
    public function testGetAndReturnEnum(): void {
        $testId = 'endpoints.enum.get_and_return_enum.0';
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
        $client->endpoints->enum->getAndReturnEnum(
            WeatherReport::Sunny->value,
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/enum",
            null,
            1
        );
    }
}
