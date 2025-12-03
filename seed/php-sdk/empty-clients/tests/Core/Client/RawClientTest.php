<?php

namespace Seed\Tests\Core\Client;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Message\RequestInterface;
use Seed\Core\Client\HttpMethod;
use Seed\Core\Client\RawClient;
use Seed\Core\Client\RetryMiddleware;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

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
}