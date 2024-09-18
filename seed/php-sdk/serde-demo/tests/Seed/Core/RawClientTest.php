<?php

namespace Seed\Core;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\RequestInterface;

class RawClientTest extends TestCase
{
    private string $baseUrl = 'https://api.example.com';
    private MockHandler $mockHandler;
    private RawClient $rawClient;

    protected function setUp(): void
    {
        $this->mockHandler = new MockHandler();
        $handlerStack = HandlerStack::create($this->mockHandler);
        $client = new Client(['handler' => $handlerStack]);
        $this->rawClient = new RawClient($client);
    }

    public function testHeaders(): void
    {
        $this->mockHandler->append(new Response(200));

        $request = new JsonApiRequest(
            $this->baseUrl,
            '/test',
            HttpMethod::GET,
            ['X-Custom-Header' => 'TestValue']
        );

        $this->sendRequest($request);

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals('TestValue', $lastRequest->getHeaderLine('X-Custom-Header'));
    }

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

        $this->sendRequest($request);

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals(
            'https://api.example.com/test?param1=value1&param2=a&param2=b&param3=true',
            (string)$lastRequest->getUri()
        );
    }

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

        $this->sendRequest($request);

        $lastRequest = $this->mockHandler->getLastRequest();
        assert($lastRequest instanceof RequestInterface);
        $this->assertEquals('application/json', $lastRequest->getHeaderLine('Content-Type'));
        $this->assertEquals(json_encode($body), (string)$lastRequest->getBody());
    }

    private function sendRequest(BaseApiRequest $request): void
    {
        try {
            $this->rawClient->sendRequest($request);
        } catch (\Throwable $e) {
            $this->fail('An exception was thrown: ' . $e->getMessage());
        }
    }
}
