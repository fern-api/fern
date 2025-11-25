namespace Seed\Tests;

use PHPUnit\Framework\TestCase;
use Seed\SeedClient;
use DateTime;

class EndpointsPrimitiveWireTest extends TestCase
{

    /**
     */
    public function testGetAndReturnString(): void {
        $testId = 'endpoints.primitive.get_and_return_string.0';
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
        $client->endpoints->primitive->getAndReturnString(
            'string',
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/string",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnInt(): void {
        $testId = 'endpoints.primitive.get_and_return_int.0';
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
        $client->endpoints->primitive->getAndReturnInt(
            1,
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/integer",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnLong(): void {
        $testId = 'endpoints.primitive.get_and_return_long.0';
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
        $client->endpoints->primitive->getAndReturnLong(
            1000000,
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/long",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnDouble(): void {
        $testId = 'endpoints.primitive.get_and_return_double.0';
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
        $client->endpoints->primitive->getAndReturnDouble(
            1.1,
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/double",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnBool(): void {
        $testId = 'endpoints.primitive.get_and_return_bool.0';
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
        $client->endpoints->primitive->getAndReturnBool(
            true,
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/boolean",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnDatetime(): void {
        $testId = 'endpoints.primitive.get_and_return_datetime.0';
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
        $client->endpoints->primitive->getAndReturnDatetime(
            new DateTime('2024-01-15T09:30:00Z'),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/datetime",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnDate(): void {
        $testId = 'endpoints.primitive.get_and_return_date.0';
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
        $client->endpoints->primitive->getAndReturnDate(
            new DateTime('2023-01-15'),
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/date",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnUuid(): void {
        $testId = 'endpoints.primitive.get_and_return_uuid.0';
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
        $client->endpoints->primitive->getAndReturnUuid(
            'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/uuid",
            null,
            1
        );
    }

    /**
     */
    public function testGetAndReturnBase64(): void {
        $testId = 'endpoints.primitive.get_and_return_base_64.0';
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
        $client->endpoints->primitive->getAndReturnBase64(
            'SGVsbG8gd29ybGQh',
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/primitive/base64",
            null,
            1
        );
    }
}
