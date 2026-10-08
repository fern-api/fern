<?php

namespace Seed\Tests;

use Seed\Tests\Wire\WireMockTestCase;
use Seed\SeedClient;
use Seed\Simple\Types\FooRequest;
use Seed\Exceptions\SeedApiException;

class SimpleWireTest extends WireMockTestCase
{
    /**
     * @var SeedClient $client
     */
    private SeedClient $client;

    /**
     */
    public function testFooWithoutEndpointError(): void {
        $testId = 'simple.foo_without_endpoint_error.0';
        $this->client->simple->fooWithoutEndpointError(
            new FooRequest([
                'bar' => 'bar',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'simple.foo_without_endpoint_error.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo1",
            null,
            1
        );
    }

    /**
     */
    public function testFooWithoutEndpointErrorThrowsNotFoundError(): void {
        $testId = 'simple.foo_without_endpoint_error.1';
        try {
            $this->client->simple->fooWithoutEndpointError(
                new FooRequest([
                    'bar' => 'bar',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo_without_endpoint_error.1',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(404, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message","code":1}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo1",
            null,
            1
        );
    }

    /**
     */
    public function testFooWithoutEndpointErrorThrowsBadRequestError(): void {
        $testId = 'simple.foo_without_endpoint_error.2';
        try {
            $this->client->simple->fooWithoutEndpointError(
                new FooRequest([
                    'bar' => 'bar',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo_without_endpoint_error.2',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(400, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message","code":1}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo1",
            null,
            1
        );
    }

    /**
     */
    public function testFooWithoutEndpointErrorThrowsInternalServerError(): void {
        $testId = 'simple.foo_without_endpoint_error.3';
        try {
            $this->client->simple->fooWithoutEndpointError(
                new FooRequest([
                    'bar' => 'bar',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo_without_endpoint_error.3',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(500, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message","code":1}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo1",
            null,
            1
        );
    }

    /**
     */
    public function testFoo(): void {
        $testId = 'simple.foo.0';
        $this->client->simple->foo(
            new FooRequest([
                'bar' => 'bar',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'simple.foo.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo2",
            null,
            1
        );
    }

    /**
     */
    public function testFooThrowsFooTooMuch(): void {
        $testId = 'simple.foo.1';
        try {
            $this->client->simple->foo(
                new FooRequest([
                    'bar' => 'bar',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo.1',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(429, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message","code":1}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo2",
            null,
            1
        );
    }

    /**
     */
    public function testFooThrowsFooTooLittle(): void {
        $testId = 'simple.foo.2';
        try {
            $this->client->simple->foo(
                new FooRequest([
                    'bar' => 'bar',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo.2',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(500, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message","code":1}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo2",
            null,
            1
        );
    }

    /**
     */
    public function testFooThrowsNotFoundError(): void {
        $testId = 'simple.foo.3';
        try {
            $this->client->simple->foo(
                new FooRequest([
                    'bar' => 'bar',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo.3',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(404, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message","code":1}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo2",
            null,
            1
        );
    }

    /**
     */
    public function testFooThrowsBadRequestError(): void {
        $testId = 'simple.foo.4';
        try {
            $this->client->simple->foo(
                new FooRequest([
                    'bar' => 'bar',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo.4',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(400, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message","code":1}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo2",
            null,
            1
        );
    }

    /**
     */
    public function testFooThrowsInternalServerError(): void {
        $testId = 'simple.foo.5';
        try {
            $this->client->simple->foo(
                new FooRequest([
                    'bar' => 'bar',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo.5',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(500, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"message","code":1}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo2",
            null,
            1
        );
    }

    /**
     */
    public function testFooWithExamples(): void {
        $testId = 'simple.foo_with_examples.0';
        $this->client->simple->fooWithExamples(
            new FooRequest([
                'bar' => 'hello',
            ]),
            [
                'headers' => [
                    'X-Test-Id' => 'simple.foo_with_examples.0',
                ],
            ],
        );
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo3",
            null,
            1
        );
    }

    /**
     */
    public function testFooWithExamplesThrowsFooTooMuch(): void {
        $testId = 'simple.foo_with_examples.1';
        try {
            $this->client->simple->fooWithExamples(
                new FooRequest([
                    'bar' => 'hello',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo_with_examples.1',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(429, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"Too much foo","code":1}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo3",
            null,
            1
        );
    }

    /**
     */
    public function testFooWithExamplesThrowsFooTooLittle(): void {
        $testId = 'simple.foo_with_examples.2';
        try {
            $this->client->simple->fooWithExamples(
                new FooRequest([
                    'bar' => 'hello',
                ]),
                [
                    'headers' => [
                        'X-Test-Id' => 'simple.foo_with_examples.2',
                    ],
                ],
            );
            $this->fail('Expected SeedApiException to be thrown');
        } catch (SeedApiException $exception) {
            $this->assertSame(500, $exception->getCode());
            $body = $exception->getBody();
            $this->assertIsString($body);
            $this->assertJsonStringEqualsJsonString('{"message":"Too little foo","code":2}', $body);
        }
        $this->verifyRequestCount(
            $testId,
            "POST",
            "/foo3",
            null,
            1
        );
    }

    /**
     */
    protected function setUp(): void {
        parent::setUp();
        $wiremockUrl = getenv('WIREMOCK_URL') ?: 'http://localhost:8080';
        $this->client = new SeedClient(
            options: [
                'baseUrl' => $wiremockUrl,
                'maxRetries' => 0,
            ]
        );
    }
}
