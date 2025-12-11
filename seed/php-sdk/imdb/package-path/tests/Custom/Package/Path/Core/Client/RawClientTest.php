<?php

namespace Custom\Package\Path\Tests\Core\Client;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Promise as P;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Message\RequestInterface;
use Custom\Package\Path\Core\Client\HttpMethod;
use Custom\Package\Path\Core\Client\RawClient;
use Custom\Package\Path\Core\Client\RetryMiddleware;
use Custom\Package\Path\Core\Json\JsonApiRequest;
use Custom\Package\Path\Core\Json\JsonSerializableType;
use Custom\Package\Path\Core\Json\JsonProperty;

class JsonRequest extends JsonSerializableType {
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
    private MockHandler $mockHandler;
    private RawClient $rawClient;

    protected function setUp(): void
    {
        $this->mockHandler = new MockHandler();
        $handlerStack = HandlerStack::create($this->mockHandler);
        // since the client is constructed manually, we need to add the retry middleware manually
        $handlerStack->push(RetryMiddleware::create([
            'maxRetries' => 0,
            'baseDelay' => 0,
        ]));
        $client = new Client(['handler' => $handlerStack]);
        $this->rawClient = new RawClient(['client' => $client]);
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function testHeaders(): void
    {
        $this->mockHandler->append(new Response(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET,
            ['X-Custom-Header' => 'TestValue']
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('TestValue', $lastRequest->getHeaderLine('X-Custom-Header'));
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function testQueryParameters(): void
    {
        $this->mockHandler->append(new Response(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET,
            [],
            ['param1' => 'value1', 'param2' => ['a', 'b'], 'param3' => 'true']
        );

        $this->rawClient->sendRequest($request);

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
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
        $this->mockHandler->append(new Response(200));

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

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals(json_encode($body), (string)$lastRequest->getBody());
    }

    public function testAdditionalHeaders(): void
    {
        $this->mockHandler->append(new Response(200));

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

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('1.0.0', $lastRequest->getHeaderLine('X-API-Version'));
        $this->assertEquals('test', $lastRequest->getHeaderLine('X-Tenancy'));
    }

    public function testOverrideAdditionalHeaders(): void
    {
        $this->mockHandler->append(new Response(200));

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

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('2.0.0', $lastRequest->getHeaderLine('X-API-Version'));
    }

    public function testAdditionalBodyProperties(): void
    {
        $this->mockHandler->append(new Response(200));

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

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals(json_encode($expectedJson), (string)$lastRequest->getBody());
    }

    public function testOverrideAdditionalBodyProperties(): void
    {
        $this->mockHandler->append(new Response(200));

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

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals(json_encode($expectedJson), (string)$lastRequest->getBody());
    }

    public function testAdditionalQueryParameters(): void
    {
        $this->mockHandler->append(new Response(200));

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

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('key=value&extra=42', $lastRequest->getUri()->getQuery());
    }

    public function testOverrideQueryParameters(): void
    {
        $this->mockHandler->append(new Response(200));

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

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('key=value', $lastRequest->getUri()->getQuery());
    }

    public function testDefaultRetries(): void
    {
        $this->mockHandler->append(new Response(500));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET
        );

        try {
            $this->rawClient->sendRequest($request);
            $this->fail("Request should've failed but succeeded.");
        } catch (ClientExceptionInterface) {
        }

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals(0, $this->mockHandler->count());
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function testExplicitRetriesSuccess(): void
    {
        $this->mockHandler->append(new Response(500), new Response(500), new Response(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET
        );

        $this->rawClient->sendRequest($request, ['maxRetries' => 2]);

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals(0, $this->mockHandler->count());
    }

    public function testExplicitRetriesFailure(): void
    {
        $this->mockHandler->append(new Response(500), new Response(500), new Response(500));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET
        );

        try {
            $this->rawClient->sendRequest($request, ['maxRetries' => 2]);
            $this->fail("Request should've failed but succeeded.");
        } catch (ClientExceptionInterface) {
        }

        $this->assertEquals(0, $this->mockHandler->count());
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function testShouldRetryOnStatusCodes(): void
    {
        $this->mockHandler->append(
            new Response(408),
            new Response(429),
            new Response(500),
            new Response(501),
            new Response(502),
            new Response(503),
            new Response(504),
            new Response(505),
            new Response(599),
            new Response(200),
        );
        $countOfErrorRequests = $this->mockHandler->count() - 1;

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET
        );

        $this->rawClient->sendRequest($request, ['maxRetries' => $countOfErrorRequests]);

        $this->assertEquals(0, $this->mockHandler->count());
    }

    public function testShouldFailOn400Response(): void
    {
        $this->mockHandler->append(new Response(400), new Response(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET
        );

        try {
            $this->rawClient->sendRequest($request, ['maxRetries' => 2]);
            $this->fail("Request should've failed but succeeded.");
        } catch (ClientExceptionInterface) {
        }

        $this->assertEquals(1, $this->mockHandler->count());
    }

    public function testRetryAfterSecondsHeaderControlsDelay(): void
    {
        $responses = [
            new Response(503, ['Retry-After' => '10']),
            new Response(200),
        ];
        $capturedOptions = [];

        $handler = function (RequestInterface $request, array $options) use (&$responses, &$capturedOptions) {
            $capturedOptions[] = $options;
            $response = array_shift($responses);
            return P\Create::promiseFor($response);
        };

        $middleware = RetryMiddleware::create([
            'maxRetries' => 2,
            'baseDelay' => 1000,
        ]);

        $retryHandler = $middleware($handler);
        $request = new Request('GET', $this->baseUrl . '/test');

        $promise = $retryHandler($request, ['delay' => 0]);
        $promise->wait();

        $this->assertCount(2, $capturedOptions);
        $this->assertSame(0, $capturedOptions[0]['delay']);
        $delay = $capturedOptions[1]['delay'];
        $this->assertGreaterThanOrEqual(10000, $delay);
        $this->assertLessThanOrEqual(12000, $delay);
    }

    public function testRetryAfterHttpDateHeaderIsHandled(): void
    {
        $retryAfterDate = gmdate('D, d M Y H:i:s \G\M\T', time() + 5);

        $responses = [
            new Response(503, ['Retry-After' => $retryAfterDate]),
            new Response(200),
        ];
        $capturedOptions = [];

        $handler = function (RequestInterface $request, array $options) use (&$responses, &$capturedOptions) {
            $capturedOptions[] = $options;
            $response = array_shift($responses);
            return P\Create::promiseFor($response);
        };

        $middleware = RetryMiddleware::create([
            'maxRetries' => 2,
            'baseDelay' => 1000,
        ]);

        $retryHandler = $middleware($handler);
        $request = new Request('GET', $this->baseUrl . '/test');

        $promise = $retryHandler($request, ['delay' => 0]);
        $promise->wait();

        $this->assertCount(2, $capturedOptions);
        $delay = $capturedOptions[1]['delay'];
        $this->assertGreaterThan(0, $delay);
        $this->assertLessThanOrEqual(60000, $delay);
    }

    public function testRateLimitResetHeaderControlsDelay(): void
    {
        $resetTime = (int) floor(microtime(true)) + 5;
        $responses = [
            new Response(429, ['X-RateLimit-Reset' => (string) $resetTime]),
            new Response(200),
        ];
        $capturedOptions = [];

        $handler = function (RequestInterface $request, array $options) use (&$responses, &$capturedOptions) {
            $capturedOptions[] = $options;
            $response = array_shift($responses);
            return P\Create::promiseFor($response);
        };

        $middleware = RetryMiddleware::create([
            'maxRetries' => 2,
            'baseDelay' => 1000,
        ]);

        $retryHandler = $middleware($handler);
        $request = new Request('GET', $this->baseUrl . '/test');

        $promise = $retryHandler($request, ['delay' => 0]);
        $promise->wait();

        $this->assertCount(2, $capturedOptions);
        $delay = $capturedOptions[1]['delay'];
        $this->assertGreaterThan(0, $delay);
        $this->assertLessThanOrEqual(60000, $delay);
    }

    public function testRateLimitResetHeaderRespectsMaxDelayAndPositiveJitter(): void
    {
        $resetTime = (int) floor(microtime(true)) + 1000;
        $responses = [
            new Response(429, ['X-RateLimit-Reset' => (string) $resetTime]),
            new Response(200),
        ];
        $capturedOptions = [];

        $handler = function (RequestInterface $request, array $options) use (&$responses, &$capturedOptions) {
            $capturedOptions[] = $options;
            $response = array_shift($responses);
            return P\Create::promiseFor($response);
        };

        $middleware = RetryMiddleware::create([
            'maxRetries' => 1,
            'baseDelay' => 1000,
        ]);

        $retryHandler = $middleware($handler);
        $request = new Request('GET', $this->baseUrl . '/test');

        $promise = $retryHandler($request, ['delay' => 0]);
        $promise->wait();

        $delay = $capturedOptions[1]['delay'];
        $this->assertGreaterThanOrEqual(60000, $delay);
        $this->assertLessThanOrEqual(72000, $delay);
    }

    public function testExponentialBackoffWithSymmetricJitterWhenNoHeaders(): void
    {
        $responses = [
            new Response(503),
            new Response(200),
        ];
        $capturedOptions = [];

        $handler = function (RequestInterface $request, array $options) use (&$responses, &$capturedOptions) {
            $capturedOptions[] = $options;
            $response = array_shift($responses);
            return P\Create::promiseFor($response);
        };

        $middleware = RetryMiddleware::create([
            'maxRetries' => 1,
            'baseDelay' => 1000,
        ]);

        $retryHandler = $middleware($handler);
        $request = new Request('GET', $this->baseUrl . '/test');

        $promise = $retryHandler($request, ['delay' => 0]);
        $promise->wait();

        $this->assertCount(2, $capturedOptions);
        $delay = $capturedOptions[1]['delay'];
        $this->assertGreaterThanOrEqual(900, $delay);
        $this->assertLessThanOrEqual(1100, $delay);
    }

    public function testRetryAfterHeaderTakesPrecedenceOverRateLimitReset(): void
    {
        $resetTime = (int) floor(microtime(true)) + 30;
        $responses = [
            new Response(503, [
                'Retry-After' => '5',
                'X-RateLimit-Reset' => (string) $resetTime,
            ]),
            new Response(200),
        ];
        $capturedOptions = [];

        $handler = function (RequestInterface $request, array $options) use (&$responses, &$capturedOptions) {
            $capturedOptions[] = $options;
            $response = array_shift($responses);
            return P\Create::promiseFor($response);
        };

        $middleware = RetryMiddleware::create([
            'maxRetries' => 2,
            'baseDelay' => 1000,
        ]);

        $retryHandler = $middleware($handler);
        $request = new Request('GET', $this->baseUrl . '/test');

        $promise = $retryHandler($request, ['delay' => 0]);
        $promise->wait();

        $this->assertCount(2, $capturedOptions);
        $delay = $capturedOptions[1]['delay'];
        $this->assertGreaterThanOrEqual(5000, $delay);
        $this->assertLessThanOrEqual(6000, $delay);
    }

    public function testMaxDelayCapIsApplied(): void
    {
        $responses = [
            new Response(503, ['Retry-After' => '120']),
            new Response(200),
        ];
        $capturedOptions = [];

        $handler = function (RequestInterface $request, array $options) use (&$responses, &$capturedOptions) {
            $capturedOptions[] = $options;
            $response = array_shift($responses);
            return P\Create::promiseFor($response);
        };

        $middleware = RetryMiddleware::create([
            'maxRetries' => 2,
            'baseDelay' => 1000,
        ]);

        $retryHandler = $middleware($handler);
        $request = new Request('GET', $this->baseUrl . '/test');

        $promise = $retryHandler($request, ['delay' => 0]);
        $promise->wait();

        $this->assertCount(2, $capturedOptions);
        $delay = $capturedOptions[1]['delay'];
        $this->assertGreaterThanOrEqual(60000, $delay);
        $this->assertLessThanOrEqual(72000, $delay);
    }
}
