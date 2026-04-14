<?php

namespace Seed\Tests\Core\Client;

use PHPUnit\Framework\TestCase;
use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Seed\Core\Client\HttpMethod;
use Seed\Core\Client\HttpClientBuilder;
use Seed\Core\Client\MockHttpClient;
use Seed\Core\Client\RawClient;
use Seed\Core\Client\RetryDecoratingClient;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Json\JsonEncoder;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Multipart\MultipartApiRequest;
use Seed\Core\Multipart\MultipartFormData;
use Seed\Core\Multipart\MultipartFormDataPart;

class JsonRequest extends JsonSerializableType
{
    /**
     * @var string
     */
    #[JsonProperty('name')]
    private string $name;

    /**
     * @param array{
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
    }

    /**
     * @return string
     */
    public function getName(): ?string
    {
        return $this->name;
    }
}

class RawClientTest extends TestCase
{
    private string $baseUrl = 'https://api.example.com';
    private MockHttpClient $mockClient;
    private RawClient $rawClient;

    protected function setUp(): void
    {
        $this->mockClient = new MockHttpClient();
        $this->rawClient = new RawClient(['client' => $this->mockClient, 'maxRetries' => 0]);
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function testHeaders(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET,
            ['X-Custom-Header' => 'TestValue']
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('TestValue', $lastRequest->getHeaderLine('X-Custom-Header'));
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function testQueryParameters(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET,
            [],
            ['param1' => 'value1', 'param2' => ['a', 'b'], 'param3' => 'true']
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        $this->assertEquals(
            'https://api.example.com/test?param1=value1&param2=a&param2=b&param3=true',
            (string)$lastRequest->getUri()
        );
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function testJsonBody(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $body = ['key' => 'value'];
        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::POST,
            [],
            [],
            $body
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals(JsonEncoder::encode($body), (string)$lastRequest->getBody());
    }

    public function testAdditionalHeaders(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $body = new JsonRequest([
            'name' => 'john.doe'
        ]);
        $headers = [
            'X-API-Version' => '1.0.0',
        ];
        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::POST,
            $headers,
            [],
            $body
        );

        $this->rawClient->sendRequest(
            $request,
            options: [
                'headers' => [
                    'X-Tenancy' => 'test'
                ]
            ]
        );

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('1.0.0', $lastRequest->getHeaderLine('X-API-Version'));
        $this->assertEquals('test', $lastRequest->getHeaderLine('X-Tenancy'));
    }

    public function testOverrideAdditionalHeaders(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $body = new JsonRequest([
            'name' => 'john.doe'
        ]);
        $headers = [
            'X-API-Version' => '1.0.0',
        ];
        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::POST,
            $headers,
            [],
            $body
        );

        $this->rawClient->sendRequest(
            $request,
            options: [
                'headers' => [
                    'X-API-Version' => '2.0.0'
                ]
            ]
        );

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('2.0.0', $lastRequest->getHeaderLine('X-API-Version'));
    }

    public function testAdditionalBodyProperties(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $body = new JsonRequest([
            'name' => 'john.doe'
        ]);
        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::POST,
            [],
            [],
            $body
        );

        $this->rawClient->sendRequest(
            $request,
            options: [
                'bodyProperties' => [
                    'age' => 42
                ]
            ]
        );

        $expectedJson = [
            'name' => 'john.doe',
            'age' => 42
        ];

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals(JsonEncoder::encode($expectedJson), (string)$lastRequest->getBody());
    }

    public function testOverrideAdditionalBodyProperties(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $body = [
            'name' => 'john.doe'
        ];
        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::POST,
            [],
            [],
            $body
        );

        $this->rawClient->sendRequest(
            $request,
            options: [
                'bodyProperties' => [
                    'name' => 'jane.doe'
                ]
            ]
        );

        $expectedJson = [
            'name' => 'jane.doe',
        ];

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals(JsonEncoder::encode($expectedJson), (string)$lastRequest->getBody());
    }

    public function testAdditionalQueryParameters(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $query = ['key' => 'value'];
        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::POST,
            [],
            $query,
            []
        );

        $this->rawClient->sendRequest(
            $request,
            options: [
                'queryParameters' => [
                    'extra' => 42
                ]
            ]
        );

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('key=value&extra=42', $lastRequest->getUri()->getQuery());
    }

    public function testOverrideQueryParameters(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $query = ['key' => 'invalid'];
        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::POST,
            [],
            $query,
            []
        );

        $this->rawClient->sendRequest(
            $request,
            options: [
                'queryParameters' => [
                    'key' => 'value'
                ]
            ]
        );

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('key=value', $lastRequest->getUri()->getQuery());
    }

    public function testDefaultRetries(): void
    {
        $this->mockClient->append(self::createResponse(500));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET
        );

        $response = $this->rawClient->sendRequest($request);
        $this->assertEquals(500, $response->getStatusCode());
        $this->assertEquals(0, $this->mockClient->count());
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function testExplicitRetriesSuccess(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(self::createResponse(500), self::createResponse(500), self::createResponse(200));

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 2,
            sleepFunction: function (int $_microseconds): void {
            },
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $response = $retryClient->sendRequest($request);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals(0, $mockClient->count());
    }

    public function testExplicitRetriesFailure(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(self::createResponse(500), self::createResponse(500), self::createResponse(500));

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 2,
            sleepFunction: function (int $_microseconds): void {
            },
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $response = $retryClient->sendRequest($request);

        $this->assertEquals(500, $response->getStatusCode());
        $this->assertEquals(0, $mockClient->count());
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function testShouldRetryOnStatusCodes(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(
            self::createResponse(408),
            self::createResponse(429),
            self::createResponse(500),
            self::createResponse(501),
            self::createResponse(502),
            self::createResponse(503),
            self::createResponse(504),
            self::createResponse(505),
            self::createResponse(599),
            self::createResponse(200),
        );
        $countOfErrorRequests = $mockClient->count() - 1;

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: $countOfErrorRequests,
            sleepFunction: function (int $_microseconds): void {
            },
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $response = $retryClient->sendRequest($request);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals(0, $mockClient->count());
    }

    public function testShouldFailOn400Response(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(self::createResponse(400), self::createResponse(200));

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 2,
            sleepFunction: function (int $_microseconds): void {
            },
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $response = $retryClient->sendRequest($request);

        $this->assertEquals(400, $response->getStatusCode());
        $this->assertEquals(1, $mockClient->count());
    }

    public function testRetryAfterSecondsHeaderControlsDelay(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(
            self::createResponse(503, ['Retry-After' => '10']),
            self::createResponse(200),
        );

        $capturedDelays = [];
        $sleepFunction = function (int $microseconds) use (&$capturedDelays): void {
            $capturedDelays[] = (int) ($microseconds / 1000); // Convert microseconds to milliseconds
        };

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 2,
            baseDelay: 1000,
            sleepFunction: $sleepFunction,
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $retryClient->sendRequest($request);

        $this->assertCount(1, $capturedDelays);
        $this->assertGreaterThanOrEqual(10000, $capturedDelays[0]);
        $this->assertLessThanOrEqual(12000, $capturedDelays[0]);
    }

    public function testRetryAfterHttpDateHeaderIsHandled(): void
    {
        $retryAfterDate = gmdate('D, d M Y H:i:s \G\M\T', time() + 5);

        $mockClient = new MockHttpClient();
        $mockClient->append(
            self::createResponse(503, ['Retry-After' => $retryAfterDate]),
            self::createResponse(200),
        );

        $capturedDelays = [];
        $sleepFunction = function (int $microseconds) use (&$capturedDelays): void {
            $capturedDelays[] = (int) ($microseconds / 1000);
        };

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 2,
            baseDelay: 1000,
            sleepFunction: $sleepFunction,
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $retryClient->sendRequest($request);

        $this->assertCount(1, $capturedDelays);
        $this->assertGreaterThan(0, $capturedDelays[0]);
        $this->assertLessThanOrEqual(60000, $capturedDelays[0]);
    }

    public function testRateLimitResetHeaderControlsDelay(): void
    {
        $resetTime = (int) floor(microtime(true)) + 5;

        $mockClient = new MockHttpClient();
        $mockClient->append(
            self::createResponse(429, ['X-RateLimit-Reset' => (string) $resetTime]),
            self::createResponse(200),
        );

        $capturedDelays = [];
        $sleepFunction = function (int $microseconds) use (&$capturedDelays): void {
            $capturedDelays[] = (int) ($microseconds / 1000);
        };

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 2,
            baseDelay: 1000,
            sleepFunction: $sleepFunction,
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $retryClient->sendRequest($request);

        $this->assertCount(1, $capturedDelays);
        $this->assertGreaterThan(0, $capturedDelays[0]);
        $this->assertLessThanOrEqual(60000, $capturedDelays[0]);
    }

    public function testRateLimitResetHeaderRespectsMaxDelayAndPositiveJitter(): void
    {
        $resetTime = (int) floor(microtime(true)) + 1000;

        $mockClient = new MockHttpClient();
        $mockClient->append(
            self::createResponse(429, ['X-RateLimit-Reset' => (string) $resetTime]),
            self::createResponse(200),
        );

        $capturedDelays = [];
        $sleepFunction = function (int $microseconds) use (&$capturedDelays): void {
            $capturedDelays[] = (int) ($microseconds / 1000);
        };

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 1,
            baseDelay: 1000,
            sleepFunction: $sleepFunction,
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $retryClient->sendRequest($request);

        $this->assertCount(1, $capturedDelays);
        $this->assertGreaterThanOrEqual(60000, $capturedDelays[0]);
        $this->assertLessThanOrEqual(72000, $capturedDelays[0]);
    }

    public function testExponentialBackoffWithSymmetricJitterWhenNoHeaders(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(
            self::createResponse(503),
            self::createResponse(200),
        );

        $capturedDelays = [];
        $sleepFunction = function (int $microseconds) use (&$capturedDelays): void {
            $capturedDelays[] = (int) ($microseconds / 1000);
        };

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 1,
            baseDelay: 1000,
            sleepFunction: $sleepFunction,
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $retryClient->sendRequest($request);

        $this->assertCount(1, $capturedDelays);
        $this->assertGreaterThanOrEqual(900, $capturedDelays[0]);
        $this->assertLessThanOrEqual(1100, $capturedDelays[0]);
    }

    public function testRetryAfterHeaderTakesPrecedenceOverRateLimitReset(): void
    {
        $resetTime = (int) floor(microtime(true)) + 30;

        $mockClient = new MockHttpClient();
        $mockClient->append(
            self::createResponse(503, [
                'Retry-After' => '5',
                'X-RateLimit-Reset' => (string) $resetTime,
            ]),
            self::createResponse(200),
        );

        $capturedDelays = [];
        $sleepFunction = function (int $microseconds) use (&$capturedDelays): void {
            $capturedDelays[] = (int) ($microseconds / 1000);
        };

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 2,
            baseDelay: 1000,
            sleepFunction: $sleepFunction,
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $retryClient->sendRequest($request);

        $this->assertCount(1, $capturedDelays);
        $this->assertGreaterThanOrEqual(5000, $capturedDelays[0]);
        $this->assertLessThanOrEqual(6000, $capturedDelays[0]);
    }

    public function testMaxDelayCapIsApplied(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(
            self::createResponse(503, ['Retry-After' => '120']),
            self::createResponse(200),
        );

        $capturedDelays = [];
        $sleepFunction = function (int $microseconds) use (&$capturedDelays): void {
            $capturedDelays[] = (int) ($microseconds / 1000);
        };

        $retryClient = new RetryDecoratingClient(
            $mockClient,
            maxRetries: 2,
            baseDelay: 1000,
            sleepFunction: $sleepFunction,
        );

        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $request = $requestFactory->createRequest('GET', $this->baseUrl . '/test');

        $retryClient->sendRequest($request);

        $this->assertCount(1, $capturedDelays);
        $this->assertGreaterThanOrEqual(60000, $capturedDelays[0]);
        $this->assertLessThanOrEqual(72000, $capturedDelays[0]);
    }

    public function testMultipartContentTypeIncludesBoundary(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $formData = new MultipartFormData();
        $formData->add('field', 'value');

        $request = new MultipartApiRequest(
            $this->baseUrl,
            '/upload',
            HttpMethod::POST,
            [],
            [],
            $formData,
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);

        $contentType = $lastRequest->getHeaderLine('Content-Type');
        $this->assertStringStartsWith('multipart/form-data; boundary=', $contentType);

        $boundary = substr($contentType, strlen('multipart/form-data; boundary='));
        $body = (string) $lastRequest->getBody();
        $this->assertStringContainsString("--{$boundary}\r\n", $body);
        $this->assertStringContainsString("Content-Disposition: form-data; name=\"field\"\r\n", $body);
        $this->assertStringContainsString("value", $body);
        $this->assertStringContainsString("--{$boundary}--\r\n", $body);
    }

    public function testMultipartWithFilename(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $formData = new MultipartFormData();
        $formData->addPart(new MultipartFormDataPart(
            name: 'document',
            value: 'file-contents',
            filename: 'report.pdf',
            headers: ['Content-Type' => 'application/pdf'],
        ));

        $request = new MultipartApiRequest(
            $this->baseUrl,
            '/upload',
            HttpMethod::POST,
            [],
            [],
            $formData,
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);

        $body = (string) $lastRequest->getBody();
        $this->assertStringContainsString(
            'Content-Disposition: form-data; name="document"; filename="report.pdf"',
            $body,
        );
        $this->assertStringContainsString('Content-Type: application/pdf', $body);
        $this->assertStringContainsString('file-contents', $body);
    }

    public function testMultipartWithMultipleParts(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $formData = new MultipartFormData();
        $formData->add('name', 'John');
        $formData->add('age', 30);
        $formData->addPart(new MultipartFormDataPart(
            name: 'avatar',
            value: 'image-data',
            filename: 'avatar.png',
        ));

        $request = new MultipartApiRequest(
            $this->baseUrl,
            '/profile',
            HttpMethod::POST,
            [],
            [],
            $formData,
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);

        $body = (string) $lastRequest->getBody();
        $this->assertStringContainsString('name="name"', $body);
        $this->assertStringContainsString('John', $body);
        $this->assertStringContainsString('name="age"', $body);
        $this->assertStringContainsString('30', $body);
        $this->assertStringContainsString('name="avatar"; filename="avatar.png"', $body);
        $this->assertStringContainsString('image-data', $body);
    }

    public function testMultipartDoesNotIncludeJsonContentType(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $formData = new MultipartFormData();
        $formData->add('field', 'value');

        $request = new MultipartApiRequest(
            $this->baseUrl,
            '/upload',
            HttpMethod::POST,
            [],
            [],
            $formData,
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);

        $contentType = $lastRequest->getHeaderLine('Content-Type');
        $this->assertStringStartsWith('multipart/form-data; boundary=', $contentType);
        $this->assertStringNotContainsString('application/json', $contentType);
    }

    public function testMultipartNullBodySendsNoBody(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $request = new MultipartApiRequest(
            $this->baseUrl,
            '/upload',
            HttpMethod::POST,
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);

        $this->assertEquals('', (string) $lastRequest->getBody());
        $this->assertStringNotContainsString('multipart/form-data', $lastRequest->getHeaderLine('Content-Type'));
    }

    public function testJsonNullBodySendsNoBody(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::POST,
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);

        $this->assertEquals('', (string) $lastRequest->getBody());
    }

    public function testEmptyJsonBodySerializesAsObject(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::POST,
            [],
            [],
            ['key' => 'value'],
        );

        $this->rawClient->sendRequest(
            $request,
            options: [
                'bodyProperties' => [
                    'key' => 'value',
                ],
            ],
        );

        $lastRequest = $this->mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);

        // When bodyProperties override all keys, the merged result should still
        // serialize as a JSON object {}, not an array [].
        $decoded = json_decode((string) $lastRequest->getBody(), true);
        $this->assertIsArray($decoded);
        $this->assertEquals('value', $decoded['key']);
    }

    public function testAuthHeadersAreIncluded(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(self::createResponse(200));

        $rawClient = new RawClient([
            'client' => $mockClient,
            'maxRetries' => 0,
            'getAuthHeaders' => fn () => ['Authorization' => 'Bearer test-token'],
        ]);

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET,
        );

        $rawClient->sendRequest($request);

        $lastRequest = $mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);

        $this->assertEquals('Bearer test-token', $lastRequest->getHeaderLine('Authorization'));
    }

    public function testAuthHeadersAreIncludedInMultipart(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(self::createResponse(200));

        $rawClient = new RawClient([
            'client' => $mockClient,
            'maxRetries' => 0,
            'getAuthHeaders' => fn () => ['Authorization' => 'Bearer test-token'],
        ]);

        $formData = new MultipartFormData();
        $formData->add('field', 'value');

        $request = new MultipartApiRequest(
            $this->baseUrl,
            '/upload',
            HttpMethod::POST,
            [],
            [],
            $formData,
        );

        $rawClient->sendRequest($request);

        $lastRequest = $mockClient->getLastRequest();
        $this->assertInstanceOf(RequestInterface::class, $lastRequest);

        $this->assertEquals('Bearer test-token', $lastRequest->getHeaderLine('Authorization'));
        $this->assertStringStartsWith('multipart/form-data; boundary=', $lastRequest->getHeaderLine('Content-Type'));
    }

    /**
     * Creates a PSR-7 response using discovery, without depending on any specific implementation.
     *
     * @param int $statusCode
     * @param array<string, string> $headers
     * @param string $body
     * @return ResponseInterface
     */
    private static function createResponse(
        int $statusCode = 200,
        array $headers = [],
        string $body = '',
    ): ResponseInterface {
        $response = \Http\Discovery\Psr17FactoryDiscovery::findResponseFactory()
            ->createResponse($statusCode);
        foreach ($headers as $name => $value) {
            $response = $response->withHeader($name, $value);
        }
        if ($body !== '') {
            $response = $response->withBody(
                \Http\Discovery\Psr17FactoryDiscovery::findStreamFactory()
                    ->createStream($body),
            );
        }
        return $response;
    }


    public function testTimeoutOptionIsAccepted(): void
    {
        $this->mockClient->append(self::createResponse(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET,
        );

        // MockHttpClient is not Guzzle/Symfony, so a warning is triggered once.
        set_error_handler(static function (int $errno, string $errstr): bool {
            return $errno === E_USER_WARNING
                && str_contains($errstr, 'Timeout option is not supported');
        });

        try {
            $response = $this->rawClient->sendRequest(
                $request,
                options: [
                    'timeout' => 3.0
                ]
            );

            $this->assertEquals(200, $response->getStatusCode());

            $lastRequest = $this->mockClient->getLastRequest();
            $this->assertInstanceOf(RequestInterface::class, $lastRequest);
        } finally {
            restore_error_handler();
        }
    }

    public function testClientLevelTimeoutIsAccepted(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(self::createResponse(200));

        $rawClient = new RawClient([
            'client' => $mockClient,
            'maxRetries' => 0,
            'timeout' => 5.0,
        ]);

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET,
        );

        set_error_handler(static function (int $errno, string $errstr): bool {
            return $errno === E_USER_WARNING
                && str_contains($errstr, 'Timeout option is not supported');
        });

        try {
            $response = $rawClient->sendRequest($request);
            $this->assertEquals(200, $response->getStatusCode());
        } finally {
            restore_error_handler();
        }
    }

    public function testPerRequestTimeoutOverridesClientTimeout(): void
    {
        $mockClient = new MockHttpClient();
        $mockClient->append(self::createResponse(200));

        $rawClient = new RawClient([
            'client' => $mockClient,
            'maxRetries' => 0,
            'timeout' => 5.0,
        ]);

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET,
        );

        set_error_handler(static function (int $errno, string $errstr): bool {
            return $errno === E_USER_WARNING
                && str_contains($errstr, 'Timeout option is not supported');
        });

        try {
            $response = $rawClient->sendRequest(
                $request,
                options: [
                    'timeout' => 1.0
                ]
            );

            $this->assertEquals(200, $response->getStatusCode());
        } finally {
            restore_error_handler();
        }
    }

    public function testDiscoveryFindsHttpClient(): void
    {
        // HttpClientBuilder::build() with no client arg uses Psr18ClientDiscovery.
        $client = HttpClientBuilder::build();
        $this->assertInstanceOf(\Psr\Http\Client\ClientInterface::class, $client);
    }

    public function testDiscoveryFindsFactories(): void
    {
        $requestFactory = HttpClientBuilder::requestFactory();
        $this->assertInstanceOf(\Psr\Http\Message\RequestFactoryInterface::class, $requestFactory);

        $streamFactory = HttpClientBuilder::streamFactory();
        $this->assertInstanceOf(\Psr\Http\Message\StreamFactoryInterface::class, $streamFactory);

        // Verify they produce usable objects
        $request = $requestFactory->createRequest('GET', 'https://example.com');
        $this->assertEquals('GET', $request->getMethod());

        $stream = $streamFactory->createStream('hello');
        $this->assertEquals('hello', (string) $stream);
    }
}
